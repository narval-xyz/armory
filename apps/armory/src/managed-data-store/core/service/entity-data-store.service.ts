import { EntityStore } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SetEntityStoreResponse } from '../../http/rest/dto/set-entity-store.dto'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class EntityDataStoreService extends SignatureService {
  constructor(
    private entitydataStoreRepository: EntityDataStoreRepository,
    private clientService: ClientService,
    private clusterService: ClusterService
  ) {
    super()
  }

  async getEntities(clientId: string): Promise<EntityStore | null> {
    const entityStore = await this.entitydataStoreRepository.getLatestDataStore(clientId)

    return entityStore ? EntityStore.parse(entityStore.data) : null
  }

  async setEntities(clientId: string, payload: EntityStore) {
    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const latestDataStore = await this.entitydataStoreRepository.getLatestDataStore(clientId)

    try {
      await this.verifySignature({
        payload,
        pubKey: publicKeySchema.parse(client.dataStore.entityPublicKey),
        date: latestDataStore?.createdAt
      })
    } catch (error) {
      throw new ApplicationException({
        message: 'Invalid signature',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    const { data, version } = await this.entitydataStoreRepository.setDataStore(clientId, {
      version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
      data: EntityStore.parse(payload)
    })

    const success = await this.clusterService.sync(clientId)

    return SetEntityStoreResponse.parse({
      latestSync: { success },
      entity: EntityStore.parse(data),
      version
    })
  }
}

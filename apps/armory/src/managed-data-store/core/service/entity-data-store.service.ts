import { LoggerService } from '@narval/nestjs-shared'
import { EntityStore } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class EntityDataStoreService extends SignatureService {
  constructor(
    private entityDataStoreRepository: EntityDataStoreRepository,
    private clientService: ClientService,
    private clusterService: ClusterService,
    loggerService: LoggerService
  ) {
    super(loggerService)
  }

  async getEntities(clientId: string): Promise<EntityStore | null> {
    const entityStore = await this.withExecutionTimeLog({
      clientId,
      id: 'entityDataStoreRepository.getLatestDataStore',
      thunk: () => this.entityDataStoreRepository.getLatestDataStore(clientId)
    })

    if (entityStore) {
      return this.withExecutionTimeLog({
        clientId,
        id: 'EntityStore.parse',
        thunk: () => EntityStore.parse(entityStore.data)
      })
    }

    return null
  }

  async setEntities(clientId: string, payload: EntityStore) {
    const client = await this.withExecutionTimeLog({
      clientId,
      id: 'clientService.findById',
      thunk: () => this.clientService.findById(clientId)
    })

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const latestDataStore = await this.withExecutionTimeLog({
      clientId,
      id: 'entityDataStoreRepository.getLatestDataStore',
      thunk: () => this.entityDataStoreRepository.getLatestDataStore(clientId)
    })

    await this.withExecutionTimeLog({
      clientId,
      id: 'verifySignature(entity)',
      thunk: () =>
        this.verifySignature({
          payload,
          keys: client.dataStore.entityPublicKeys,
          date: latestDataStore?.createdAt
        })
    })

    const { data, version } = await this.withExecutionTimeLog({
      clientId,
      id: 'entityDataStoreRepository.setDataStore',
      thunk: () =>
        this.entityDataStoreRepository.setDataStore(clientId, {
          version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
          data: EntityStore.parse(payload)
        })
    })

    const success = await this.withExecutionTimeLog({
      clientId,
      id: 'clusterService.sync(entity)',
      thunk: () => this.clusterService.sync(clientId)
    })

    const entity = await this.withExecutionTimeLog({
      clientId,
      id: 'EntityStore.parse',
      thunk: () => EntityStore.parse(data)
    })

    return {
      latestSync: { success },
      entity,
      version
    }
  }
}

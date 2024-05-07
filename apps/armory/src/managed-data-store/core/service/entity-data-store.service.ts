import { Entities, EntityStore } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class EntityDataStoreService extends SignatureService<Entities> {
  constructor(
    private entitydataStoreRepository: EntityDataStoreRepository,
    private clientRepository: ClientRepository
  ) {
    super()
  }

  async getEntities(orgId: string): Promise<EntityStore | null> {
    const entityStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    return entityStore ? EntityStore.parse(entityStore.data) : null
  }

  async setEntities(orgId: string, payload: EntityStore) {
    const client = await this.clientRepository.getClient(orgId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const dataStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    await this.verifySignature({
      payload,
      pubKey: publicKeySchema.parse(client.entityPublicKey),
      date: dataStore?.createdAt
    })

    return this.entitydataStoreRepository.setDataStore(orgId, {
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: EntityStore.parse(payload)
    })
  }
}

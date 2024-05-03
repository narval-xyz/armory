import { Entities, EntityStore } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class EntityDataStoreService extends SignatureService<Entities> {
  constructor(
    private entitydataStoreRepository: EntityDataStoreRepository,
    private engineRepository: EngineRepository
  ) {
    super()
  }

  async getEntities(orgId: string): Promise<{ entity: EntityStore } | null> {
    const entityStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    if (!entityStore) {
      return null
    }

    return { entity: EntityStore.parse(entityStore.data) }
  }

  async setEntities({ orgId, payload }: { orgId: string; payload: EntityStore }) {
    const engine = await this.engineRepository.getEngineData(orgId)

    if (!engine) {
      throw new NotFoundException({
        message: 'Engine not found',
        suggestedHttpStatusCode: 404
      })
    }

    const dataStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    await this.verifySignature({
      payload,
      key: engine.entityKey as Jwk,
      timestamp: dataStore?.createdAt
    })

    return this.entitydataStoreRepository.setDataStore({
      orgId,
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: payload
    })
  }
}

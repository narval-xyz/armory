import { Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EngineRepository } from '../../persistence/repository/engine.repository'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class PolicyDataStoreService extends SignatureService<Policy[]> {
  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private engineRepository: EngineRepository
  ) {
    super()
  }

  async getPolicies(orgId: string): Promise<{ policy: PolicyStore } | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    if (!policyStore) {
      return null
    }

    const { data: policy } = policyStore

    return { policy: PolicyStore.parse(policy) }
  }

  async setPolicies({ orgId, payload }: { orgId: string; payload: PolicyStore }) {
    const engine = await this.engineRepository.getEngineData(orgId)

    if (!engine) {
      throw new NotFoundException({
        message: 'Engine not found',
        suggestedHttpStatusCode: 404
      })
    }

    const dataStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    await this.verifySignature({
      payload,
      key: engine.entityKey as Jwk,
      timestamp: dataStore?.createdAt
    })

    return this.policyDataStoreRepository.setDataStore({
      orgId,
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: payload
    })
  }
}

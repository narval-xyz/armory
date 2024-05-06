import { Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class PolicyDataStoreService extends SignatureService<Policy[]> {
  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private clientRepository: ClientRepository
  ) {
    super()
  }

  async getPolicies(orgId: string): Promise<PolicyStore | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    return policyStore ? PolicyStore.parse(policyStore.data) : null
  }

  async setPolicies({ orgId, payload }: { orgId: string; payload: PolicyStore }) {
    const client = await this.clientRepository.getClientData(orgId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: 404
      })
    }

    const dataStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    await this.verifySignature({
      payload,
      key: client.policyPubKey as Jwk,
      timestamp: dataStore?.createdAt
    })

    return this.policyDataStoreRepository.setDataStore({
      orgId,
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: payload
    })
  }
}

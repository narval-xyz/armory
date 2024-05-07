import { Policy, PolicyStore } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
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

  async getPolicies(clientId: string): Promise<PolicyStore | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    return policyStore ? PolicyStore.parse(policyStore.data) : null
  }

  async setPolicies(clientId: string, payload: PolicyStore) {
    const client = await this.clientRepository.getClient(clientId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const dataStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    await this.verifySignature({
      payload,
      pubKey: publicKeySchema.parse(client.policyPublicKey),
      date: dataStore?.createdAt
    })

    return this.policyDataStoreRepository.setDataStore(clientId, {
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: PolicyStore.parse(payload)
    })
  }
}

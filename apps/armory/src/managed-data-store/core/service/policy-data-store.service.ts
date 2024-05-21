import { PolicyStore } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class PolicyDataStoreService extends SignatureService {
  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private clientService: ClientService
  ) {
    super()
  }

  async getPolicies(clientId: string): Promise<PolicyStore | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    return policyStore ? PolicyStore.parse(policyStore.data) : null
  }

  async setPolicies(clientId: string, payload: PolicyStore) {
    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const dataStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    await this.verifySignature({
      payload,
      pubKey: publicKeySchema.parse(client.dataStore.policyPublicKey),
      date: dataStore?.createdAt
    })

    return this.policyDataStoreRepository.setDataStore(clientId, {
      version: dataStore?.version ? dataStore.version + 1 : 1,
      data: PolicyStore.parse(payload)
    })
  }
}

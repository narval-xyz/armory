import { PolicyStore } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class PolicyDataStoreService extends SignatureService {
  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private clientService: ClientService,
    private clusterService: ClusterService
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

    const latestDataStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    await this.verifySignature({
      payload,
      pubKey: publicKeySchema.parse(client.dataStore.policyPublicKey),
      date: latestDataStore?.createdAt
    })

    const { data, version } = await this.policyDataStoreRepository.setDataStore(clientId, {
      version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
      data: PolicyStore.parse(payload)
    })

    const synced = await this.clusterService.sync(clientId)

    return { policy: PolicyStore.parse(data), version, synced }
  }
}

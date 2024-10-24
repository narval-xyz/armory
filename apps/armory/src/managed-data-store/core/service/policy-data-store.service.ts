import { LoggerService } from '@narval/nestjs-shared'
import { PolicyStore } from '@narval/policy-engine-shared'
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
    private clusterService: ClusterService,
    loggerService: LoggerService
  ) {
    super(loggerService)
  }

  async getPolicies(clientId: string): Promise<PolicyStore | null> {
    const policyStore = await this.withExecutionTimeLog({
      clientId,
      id: 'policyDataStoreRepository.getLatestDataStore',
      thunk: () => this.policyDataStoreRepository.getLatestDataStore(clientId)
    })

    if (policyStore) {
      return this.withExecutionTimeLog({
        clientId,
        id: 'PolicyStore.parse',
        thunk: () => PolicyStore.parse(policyStore.data)
      })
    }

    return null
  }

  async setPolicies(clientId: string, payload: PolicyStore) {
    const client = await this.withExecutionTimeLog({
      clientId,
      id: 'clientService.findById',
      thunk: async () => this.clientService.findById(clientId)
    })

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const latestDataStore = await this.withExecutionTimeLog({
      clientId,
      id: 'policyDataStoreRepository.getLatestDataStore',
      thunk: () => this.policyDataStoreRepository.getLatestDataStore(clientId)
    })

    await this.withExecutionTimeLog({
      clientId,
      id: 'verifySignature(policy)',
      thunk: () =>
        this.verifySignature({
          payload,
          keys: client.dataStore.policyPublicKeys,
          date: latestDataStore?.createdAt
        })
    })

    const { data, version } = await this.withExecutionTimeLog({
      clientId,
      id: 'policyDataStoreRepository.setDataStore',
      thunk: () =>
        this.policyDataStoreRepository.setDataStore(clientId, {
          version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
          data: PolicyStore.parse(payload)
        })
    })

    const success = await this.withExecutionTimeLog({
      clientId,
      thunk: () => this.clusterService.sync(clientId),
      id: 'clusterService.sync(policy)'
    })

    const policy = await this.withExecutionTimeLog({
      clientId,
      id: 'PolicyStore.parse',
      thunk: () => PolicyStore.parse(data)
    })

    return {
      latestSync: { success },
      policy,
      version
    }
  }
}

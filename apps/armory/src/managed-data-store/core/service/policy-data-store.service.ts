import { MetricService, OTEL_ATTR_CLIENT_ID, TraceService } from '@narval/nestjs-shared'
import { PolicyStore } from '@narval/policy-engine-shared'
import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class PolicyDataStoreService extends SignatureService {
  private getCounter: Counter
  private setCounter: Counter

  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private clientService: ClientService,
    private clusterService: ClusterService,
    @Inject(TraceService) private traceService: TraceService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    super()

    this.getCounter = this.metricService.createCounter('policy_data_store_get_count')
    this.setCounter = this.metricService.createCounter('policy_data_store_set_count')
  }

  async getPolicies(clientId: string): Promise<PolicyStore | null> {
    this.getCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const span = this.traceService.startSpan(`${PolicyDataStoreService.name}.getPolicies`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: clientId }
    })

    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(clientId)

    const response = policyStore ? PolicyStore.parse(policyStore.data) : null

    span.end()

    return response
  }

  async setPolicies(clientId: string, payload: PolicyStore) {
    this.setCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const span = this.traceService.startSpan(`${PolicyDataStoreService.name}.setPolicies`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: clientId }
    })

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
      keys: client.dataStore.policyPublicKeys,
      date: latestDataStore?.createdAt
    })

    const { data, version } = await this.policyDataStoreRepository.setDataStore(clientId, {
      version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
      data: PolicyStore.parse(payload)
    })

    const success = await this.clusterService.sync(clientId)

    const response = {
      latestSync: { success },
      policy: PolicyStore.parse(data),
      version
    }

    span.end()

    return response
  }
}

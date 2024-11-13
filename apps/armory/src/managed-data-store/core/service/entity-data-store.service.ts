import { MetricService, OTEL_ATTR_CLIENT_ID, TraceService } from '@narval/nestjs-shared'
import { EntityStore } from '@narval/policy-engine-shared'
import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { ClientService } from '../../../client/core/service/client.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { SetEntityStoreResponse } from '../../http/rest/dto/set-entity-store.dto'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { SignatureService } from './signature.service'

@Injectable()
export class EntityDataStoreService extends SignatureService {
  private getCounter: Counter
  private setCounter: Counter

  constructor(
    private entityDataStoreRepository: EntityDataStoreRepository,
    private clientService: ClientService,
    private clusterService: ClusterService,
    @Inject(TraceService) private traceService: TraceService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    super()

    this.getCounter = this.metricService.createCounter('entity_data_store_get_count')
    this.setCounter = this.metricService.createCounter('entity_data_store_set_count')
  }

  async getEntities(clientId: string): Promise<EntityStore | null> {
    this.getCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const span = this.traceService.startSpan(`${EntityDataStoreService.name}.getEntities`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: clientId }
    })

    const entityStore = await this.entityDataStoreRepository.getLatestDataStore(clientId)

    const response = entityStore ? EntityStore.parse(entityStore.data) : null

    span.end()

    return response
  }

  async setEntities(clientId: string, payload: EntityStore) {
    this.setCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: clientId })

    const span = this.traceService.startSpan(`${EntityDataStoreService.name}.setEntities`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: clientId }
    })

    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new NotFoundException({
        message: 'Client data not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const latestDataStore = await this.entityDataStoreRepository.getLatestDataStore(clientId)

    await this.verifySignature({
      payload,
      keys: client.dataStore.entityPublicKeys,
      date: latestDataStore?.createdAt
    })

    const { data, version } = await this.entityDataStoreRepository.setDataStore(clientId, {
      version: latestDataStore?.version ? latestDataStore.version + 1 : 1,
      data: EntityStore.parse(payload)
    })

    const success = await this.clusterService.sync(clientId)

    const response = SetEntityStoreResponse.parse({
      latestSync: { success },
      entity: EntityStore.parse(data),
      version
    })

    span.end()

    return response
  }
}

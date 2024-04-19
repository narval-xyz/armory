import { Decision, Entities, EntityStore, EvaluationRequest } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../../../src/armory.config'
import { PolicyEngineClient } from '../../../../src/orchestration/http/client/policy-engine.client'
import { ApplicationException } from '../../../../src/shared/exception/application.exception'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'
import { FakeVaultService } from './fake-vault.service'

@Injectable()
export class EntityDataStoreService {
  constructor(
    private entitydataStoreRepository: EntityDataStoreRepository,
    private policyEngineClient: PolicyEngineClient,
    private configService: ConfigService<Config, true>,
    private fakeVaultService: FakeVaultService
  ) {}

  async getEntities(orgId: string): Promise<{ entity: EntityStore } | null> {
    const entityStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    if (!entityStore) {
      return null
    }

    return { entity: EntityStore.parse(entityStore.data) }
  }

  async setEntities({
    orgId,
    headers,
    data
  }: {
    orgId: string
    headers: Record<string, string>
    data: { evaluationRequest: EvaluationRequest; entities: Entities }
  }) {
    const evaluation = await this.policyEngineClient.evaluation({
      host: this.configService.get('policyEngine.host', { infer: true }),
      headers,
      data: data.evaluationRequest
    })
    if (evaluation.decision !== Decision.PERMIT) {
      throw new ApplicationException({
        message: `User is not permitted to perform ${Action.SET_ENTITIES} action`,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN,
        context: { evaluationRequest: data.evaluationRequest, evaluationResponse: evaluation }
      })
    }
    const signature = await this.fakeVaultService.signDataPayload(data.entities)
    const entity: EntityStore = { data: data.entities, signature }
    const version = await this.entitydataStoreRepository.getLatestVersion(orgId)

    return this.entitydataStoreRepository.setDataStore({
      orgId,
      version: version + 1,
      data: entity
    })
  }
}

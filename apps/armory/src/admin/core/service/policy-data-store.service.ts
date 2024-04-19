import { Action, Decision, EvaluationRequest, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config } from '../../../../src/armory.config'
import { PolicyEngineClient } from '../../../../src/orchestration/http/client/policy-engine.client'
import { ApplicationException } from '../../../../src/shared/exception/application.exception'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'
import { FakeVaultService } from './fake-vault.service'

@Injectable()
export class PolicyDataStoreService {
  constructor(
    private policyDataStoreRepository: PolicyDataStoreRepository,
    private policyEngineClient: PolicyEngineClient,
    private configService: ConfigService<Config, true>,
    private fakeVaultService: FakeVaultService
  ) {}

  async getPolicies(orgId: string): Promise<{ policy: PolicyStore } | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    if (!policyStore) {
      return null
    }

    const { data: policy } = policyStore

    return { policy: PolicyStore.parse(policy) }
  }

  async setPolicies({
    orgId,
    headers,
    data
  }: {
    orgId: string
    headers: Record<string, string>
    data: { evaluationRequest: EvaluationRequest; policies: Policy[] }
  }) {
    const evaluation = await this.policyEngineClient.evaluation({
      host: this.configService.get('policyEngine.host', { infer: true }),
      data: data.evaluationRequest,
      headers
    })
    if (evaluation.decision !== Decision.PERMIT) {
      throw new ApplicationException({
        message: `User is not permitted to perform ${Action.SET_POLICIES} action`,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN,
        context: { evaluationRequest: data.evaluationRequest, evaluationResponse: evaluation }
      })
    }
    const signature = await this.fakeVaultService.signDataPayload(data.policies)
    const policy: PolicyStore = { data: data.policies, signature }

    const version = await this.policyDataStoreRepository.getLatestVersion(orgId)

    return this.policyDataStoreRepository.setDataStore({
      orgId,
      version: version + 1,
      data: policy
    })
  }
}

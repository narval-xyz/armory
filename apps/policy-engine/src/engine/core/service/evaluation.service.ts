import { EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { OpenPolicyAgentEngine } from '../../../open-policy-agent/core/open-policy-agent.engine'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { TenantService } from '../../../tenant/core/service/tenant.service'

@Injectable()
export class EvaluationService {
  constructor(private tenantService: TenantService) {}

  async evaluate(clientId: string, evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const [entityStore, policyStore] = await Promise.all([
      this.tenantService.findEntityStore(clientId),
      this.tenantService.findPolicyStore(clientId)
    ])

    if (!entityStore) {
      throw new ApplicationException({
        message: 'Missing client entity store',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { clientId }
      })
    }

    if (!policyStore) {
      throw new ApplicationException({
        message: 'Missing client entity store',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { clientId }
      })
    }

    // WARN: Loading a new engine is an IO bounded process due to the Rego
    // transpilation and WASM build.
    const engine = await new OpenPolicyAgentEngine(policyStore.data, entityStore.data).load()

    return engine.evaluate(evaluation)
  }
}

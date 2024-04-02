import { ConfigService } from '@narval/config-module'
import { EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { resolve } from 'path'
import { OpenPolicyAgentEngine } from '../../../open-policy-agent/core/open-policy-agent.engine'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { ClientService } from './client.service'

@Injectable()
export class EvaluationService {
  constructor(
    private configService: ConfigService<Config>,
    private clientService: ClientService
  ) {}

  async evaluate(clientId: string, evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const client = await this.clientService.findByClientId(clientId)

    if (!client) {
      throw new ApplicationException({
        message: 'Client not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { clientId }
      })
    }

    const [entityStore, policyStore] = await Promise.all([
      this.clientService.findEntityStore(clientId),
      this.clientService.findPolicyStore(clientId)
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
    const engine = await new OpenPolicyAgentEngine({
      entities: entityStore.data,
      policies: policyStore.data,
      privateKey: client.signer.key,
      resourcePath: resolve(this.configService.get('resourcePath'))
    }).load()

    return engine.evaluate(evaluation)
  }
}

import { ConfigService } from '@narval/config-module'
import { TraceService } from '@narval/nestjs-shared'
import { Entities, Policy } from '@narval/policy-engine-shared'
import { Inject, Injectable } from '@nestjs/common'
import { resolve } from 'path'
import { OpenPolicyAgentEngine } from '../../../open-policy-agent/core/open-policy-agent.engine'
import { Config } from '../../../policy-engine.config'

@Injectable()
/**
 * Factory responsible for creating OpenPolicyAgentEngine instances.
 *
 * This factory exists primarily to improve the testability of the
 * EvaluationService by abstracting engine creation. This allows tests to
 * easily mock the engine creation process.
 */
export class OpenPolicyAgentEngineFactory {
  constructor(
    private configService: ConfigService<Config>,
    @Inject(TraceService) private traceService: TraceService
  ) {}

  async create(entities: Entities, policies: Policy[]): Promise<OpenPolicyAgentEngine> {
    return this.traceService.startActiveSpan(`${OpenPolicyAgentEngineFactory.name}.create`, () => {
      return new OpenPolicyAgentEngine({
        entities,
        policies,
        resourcePath: resolve(this.configService.get('resourcePath')),
        tracer: this.traceService.getTracer()
      }).load()
    })
  }
}

import { FIXTURE } from '@narval/policy-engine-shared'
import { Controller, Get, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common'
import { ClientSecretGuard } from '../shared/guard/client-secret.guard'
import { generateInboundEvaluationRequest } from '../shared/testing/evaluation.testing'
import { EvaluationService } from './core/service/evaluation.service'
import { TenantService } from './core/service/tenant.service'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(
    private readonly evaluationService: EvaluationService,
    private readonly tenantService: TenantService
  ) {}

  @Get()
  healthcheck() {
    return 'Running'
  }

  @Get('/ping')
  ping() {
    this.logger.log({
      message: 'Received ping'
    })
    return 'pong'
  }

  @Get('/jwk')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async getJwk() {
    try {
      const jwk = await this.tenantService.findEngineJwk()

      return jwk
    } catch (error) {
      return { ok: false }
    }
  }

  @Post('/evaluation-demo')
  async evaluateDemo() {
    const evaluation = await generateInboundEvaluationRequest()
    this.logger.log('Received evaluation', {
      evaluation
    })

    const response = await this.evaluationService.evaluate(FIXTURE.ORGANIZATION.id, evaluation)

    this.logger.log('Evaluation respone', {
      response
    })

    return {
      request: evaluation,
      response
    }
  }

  @Get('/generate-inbound-request')
  generateInboundRequest() {
    return generateInboundEvaluationRequest()
  }
}

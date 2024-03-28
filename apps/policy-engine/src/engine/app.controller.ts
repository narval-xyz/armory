import { FIXTURE } from '@narval/policy-engine-shared'
import { Controller, Get, Logger, Post } from '@nestjs/common'
import { generateInboundEvaluationRequest } from '../shared/testing/evaluation.testing'
import { EvaluationService } from './core/service/evaluation.service'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(private readonly evaluationService: EvaluationService) {}

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

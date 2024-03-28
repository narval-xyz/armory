import { FIXTURE } from '@narval/policy-engine-shared'
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common'
import { ClientId } from '../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../shared/guard/client-secret.guard'
import { generateInboundEvaluationRequest } from '../shared/testing/evaluation.testing'
import { EvaluationService } from './core/service/evaluation.service'
import { EvaluationRequestDto } from './evaluation-request.dto'

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

  @Post('/evaluation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async evaluate(@Body() body: EvaluationRequestDto, @ClientId() clientId: string) {
    this.logger.log({
      message: 'Received evaluation',
      body
    })

    const result = await this.evaluationService.evaluate(clientId, body)

    this.logger.log({
      message: 'Evaluation result',
      body: result
    })
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

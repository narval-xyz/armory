import { EvaluationRequest } from '@narval/policy-engine-shared'
import { Body, Controller, Get, Logger, Post } from '@nestjs/common'
import { generateInboundEvaluationRequest } from '../shared/testing/evaluation.testing'
import { AppService } from './app.service'
import { EvaluationRequestDto } from './evaluation-request.dto'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

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
  async evaluate(@Body() body: EvaluationRequestDto) {
    this.logger.log({
      message: 'Received evaluation',
      body
    })

    // Map the DTO into the TS type because it's nicer to deal with.
    const payload: EvaluationRequest = body

    const result = await this.appService.runEvaluation(payload)
    this.logger.log({
      message: 'Evaluation Result',
      result
    })

    return result
  }

  @Post('/evaluation-demo')
  async evaluateDemo() {
    const fakeRequest = await generateInboundEvaluationRequest()
    this.logger.log({
      message: 'Received evaluation',
      body: fakeRequest
    })
    const result = await this.appService.runEvaluation(fakeRequest)
    this.logger.log({
      message: 'Evaluation Result',
      result
    })

    return {
      request: fakeRequest,
      result
    }
  }

  @Get('/generate-inbound-request')
  generateInboundRequest() {
    return generateInboundEvaluationRequest()
  }
}

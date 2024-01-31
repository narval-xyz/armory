import { EvaluationRequestDto } from '@app/authz/app/evaluation-request.dto'
import { generateInboundRequest } from '@app/authz/app/persistence/repository/mock_data'
import { EvaluationRequest } from '@narval/authz-shared'
import { Body, Controller, Get, Logger, Post } from '@nestjs/common'
import { AppService } from './app.service'

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
    const fakeRequest = await generateInboundRequest()
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
    return generateInboundRequest()
  }
}

import { EvaluationRequestDto } from '@app/authz/app/evaluation-request.dto'
import { generateInboundRequest } from '@app/authz/shared/module/persistence/mock_data'
import { AuthZRequestPayload } from '@app/authz/shared/types/domain.type'
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
      message: 'Received evaluation'
    })

    // Map the DTO into the TS type because it's nicer to deal with.
    const payload: AuthZRequestPayload = body

    const result = await this.appService.runEvaluation(payload)
    this.logger.log({
      message: 'Evaluation Result',
      result
    })

    return result
  }

  @Post('/evaluation-demo')
  async evaluateDemo() {
    this.logger.log({
      message: 'Received evaluation'
    })
    const fakeRequest = await generateInboundRequest()
    const result = await this.appService.runEvaluation(fakeRequest)
    this.logger.log({
      message: 'Evaluation Result',
      result
    })

    return {
      request: fakeRequest,
      result,
    }
  }
}

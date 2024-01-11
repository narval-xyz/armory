import { transactionRequestIntent } from '@narval/transaction-request-intent'
import { Controller, Get, Logger, Post } from '@nestjs/common'

import { generateInboundRequest } from '@app/authz/shared/module/persistence/mock_data'
import { AppService } from './app.service'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData()
  }

  @Get('/ping')
  ping() {
    this.logger.log({
      message: 'Received ping',
      test: transactionRequestIntent()
    })

    return 'pong'
  }

  @Post('/evaluation')
  async evaluate() {
    this.logger.log({
      message: 'Received evaluation',
    })
    const fakeRequest = await generateInboundRequest()
    const result = await this.appService.runEvaluation(fakeRequest)
    this.logger.log({
      message: 'Evaluation Result',
      result
    })

    return result
  }
}

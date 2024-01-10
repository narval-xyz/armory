import { transactionRequestIntent } from '@narval/transaction-request-intent'
import { Controller, Get, Logger } from '@nestjs/common'

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
}

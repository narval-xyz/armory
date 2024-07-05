import { LoggerService } from '@narval/nestjs-shared'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller({
  version: '1'
})
@ApiTags('Application')
export class AppController {
  constructor(private logger: LoggerService) {}

  @Get()
  healthcheck() {
    return 'Running'
  }

  @Get('/ping')
  ping() {
    this.logger.log('Received ping')

    return 'pong'
  }
}

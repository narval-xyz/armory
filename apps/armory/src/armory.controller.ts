import { Controller, Get, Logger } from '@nestjs/common'

@Controller()
export class ArmoryController {
  private logger = new Logger(ArmoryController.name)

  constructor() {}

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
}

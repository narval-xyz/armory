import { Controller, Get, Logger } from '@nestjs/common'

@Controller()
export class VaultController {
  private logger = new Logger(VaultController.name)

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

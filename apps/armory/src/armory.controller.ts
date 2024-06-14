import { Controller, Get, Logger } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'

@Controller()
@ApiExcludeController()
export class ArmoryController {
  private logger = new Logger(ArmoryController.name)

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

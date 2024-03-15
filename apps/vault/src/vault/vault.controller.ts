import { Controller, Get, Logger } from '@nestjs/common'
import { VaultService } from './vault.service'

@Controller()
export class VaultController {
  private logger = new Logger(VaultController.name)

  constructor(private readonly appService: VaultService) {}

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

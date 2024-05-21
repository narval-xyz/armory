import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'

@Controller('/engine')
export class EngineController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async getApp() {
    // TODO: this endpoint should return basic Engine configuration; nothing client-specific, but the server itself.
    return 'Engine is running'
  }
}

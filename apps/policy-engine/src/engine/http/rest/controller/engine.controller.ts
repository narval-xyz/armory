import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { EngineSignerConfigService } from '../../../core/service/engine-signer-config.service'

@Controller('/engine')
export class EngineController {
  constructor(private engineSignerConfigService: EngineSignerConfigService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async getPublicJwk() {
    try {
      const engineData = await this.engineSignerConfigService.getEnginePublicJwkOrThrow()

      return engineData
    } catch (error) {
      return { ok: false }
    }
  }
}

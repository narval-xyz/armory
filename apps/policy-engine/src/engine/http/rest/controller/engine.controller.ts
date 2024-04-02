import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ClientSecretGuard } from 'apps/policy-engine/src/shared/guard/client-secret.guard'
import { EngineSignerConfigService } from '../../../core/service/engine-signer-config.service'

@Controller('/engine')
export class EngineController {
  constructor(private engineSignerConfigService: EngineSignerConfigService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async getJwk() {
    try {
      return this.engineSignerConfigService.getEngineData()
    } catch (error) {
      return { ok: false }
    }
  }
}

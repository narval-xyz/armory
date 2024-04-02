import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ClientSecretGuard } from 'apps/policy-engine/src/shared/guard/client-secret.guard'
import { EngineService } from '../../../core/service/engine.service'

@Controller('/engine')
export class EngineController {
  constructor(private engineService: EngineService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async getPublicJwk() {
    try {
      return this.engineService.getEngineOrThrow()
    } catch (error) {
      return { ok: false }
    }
  }
}

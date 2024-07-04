import { secret } from '@narval/nestjs-shared'
import { Controller, Post } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { EngineService } from '../../../core/service/engine.service'

type Response =
  | { state: 'ACTIVATED' }
  | {
      state: 'READY'
      app: {
        appId: string
        adminApiKey?: string
      }
    }

@Controller({
  path: '/apps/activate',
  version: '1'
})
@ApiExcludeController()
export class ProvisionController {
  constructor(private engineService: EngineService) {}

  @Post()
  async activate(): Promise<Response> {
    const engine = await this.engineService.getEngineOrThrow()

    if (engine.adminApiKey) {
      return { state: 'ACTIVATED' }
    }

    const adminApiKey = secret.generate()

    await this.engineService.save({
      ...engine,
      adminApiKey: secret.hash(adminApiKey)
    })

    return {
      state: 'READY',
      app: {
        appId: engine.id,
        adminApiKey
      }
    }
  }
}

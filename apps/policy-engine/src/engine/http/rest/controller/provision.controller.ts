import { secret } from '@narval/nestjs-shared'
import { Controller, Post } from '@nestjs/common'
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

@Controller('/provision')
export class ProvisionController {
  constructor(private engineService: EngineService) {}

  @Post()
  async provision(): Promise<Response> {
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

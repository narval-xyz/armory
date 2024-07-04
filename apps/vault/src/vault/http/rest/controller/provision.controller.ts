import { secret } from '@narval/nestjs-shared'
import { Controller, Post } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { AppService } from '../../../core/service/app.service'

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
  constructor(private appService: AppService) {}

  @Post()
  async provision(): Promise<Response> {
    const app = await this.appService.getAppOrThrow()

    if (app.adminApiKey) {
      return { state: 'ACTIVATED' }
    }

    const adminApiKey = secret.generate()

    await this.appService.save({
      ...app,
      adminApiKey: secret.hash(adminApiKey)
    })

    return {
      state: 'READY',
      app: {
        appId: app.id,
        adminApiKey
      }
    }
  }
}

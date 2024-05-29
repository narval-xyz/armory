import { secret } from '@narval/nestjs-shared'
import { Controller, Post } from '@nestjs/common'
import { AppService } from '../../../core/service/app.service'

type Activated = {
  isActivated: true
}

type State = {
  appId: string
  adminApiKey?: string
}

type Ready = {
  isActivated: false
  state: State
}

type ProvisionResponse = Activated | Ready

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/provision')
  async provision(): Promise<ProvisionResponse> {
    const adminApiKey = secret.generate()
    const result = await this.appService.activate(adminApiKey)

    if (result.isActivated) {
      return {
        isActivated: true
      }
    }

    return {
      isActivated: false,
      state: {
        appId: result.app.id,
        adminApiKey: result.app.adminApiKey
      }
    }
  }
}

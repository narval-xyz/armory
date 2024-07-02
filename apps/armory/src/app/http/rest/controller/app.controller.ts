import { secret } from '@narval/nestjs-shared'
import { Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { ApplicationException } from '../../../../shared/exception/application.exception'
import { AlreadyActivatedException } from '../../../core/exception/app-already-activated.exception'
import { AppService } from '../../../core/service/app.service'

type ActivateResponse =
  | { state: 'ACTIVATED' }
  | {
      state: 'READY'
      app: {
        appId: string
        adminApiKey?: string
      }
    }

@Controller({
  path: '/apps',
  version: '1'
})
@ApiExcludeController()
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/activate')
  async activate(): Promise<ActivateResponse> {
    const adminApiKey = secret.generate()

    try {
      const app = await this.appService.activate(adminApiKey)

      return {
        state: 'READY',
        app: {
          appId: app.id,
          adminApiKey
        }
      }
    } catch (error) {
      if (error instanceof AlreadyActivatedException) {
        return { state: 'ACTIVATED' }
      }

      throw new ApplicationException({
        message: 'Something went wrong during the app activation',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }
  }
}

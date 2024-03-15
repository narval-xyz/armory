import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { REQUEST_HEADER_API_KEY } from '../../main.constant'
import { AppService } from '../../vault/core/service/app.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private appService: AppService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const apiKey = req.headers[REQUEST_HEADER_API_KEY]

    if (!apiKey) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_API_KEY} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const app = await this.appService.getAppOrThrow()

    return app.adminApiKey === apiKey
  }
}

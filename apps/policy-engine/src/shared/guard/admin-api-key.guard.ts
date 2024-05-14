import { secret } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { EngineService } from '../../engine/core/service/engine.service'
import { REQUEST_HEADER_API_KEY } from '../../policy-engine.constant'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private engineService: EngineService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const apiKey = req.headers[REQUEST_HEADER_API_KEY]

    if (!apiKey) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_API_KEY} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const engine = await this.engineService.getEngineOrThrow()

    return engine.adminApiKey === secret.hash(apiKey)
  }
}

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { REQUEST_HEADER_API_KEY, REQUEST_HEADER_CLIENT_ID } from '../../main.constant'
import { TenantService } from '../../tenant/core/service/tenant.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class ClientSecretGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]
    const clientSecret = req.headers[REQUEST_HEADER_API_KEY]

    if (!clientSecret) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_API_KEY} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    } else if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }
    const tenant = await this.tenantService.findByClientId(clientId)

    return tenant?.clientSecret?.toLowerCase() === clientSecret.toLowerCase()
  }
}

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { ClientService } from '../../engine/core/service/client.service'
import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET } from '../../policy-engine.constant'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class ClientSecretGuard implements CanActivate {
  constructor(private clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientSecret = req.headers[REQUEST_HEADER_CLIENT_SECRET]
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

    if (!clientSecret) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_SECRET} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    } else if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findByClientId(clientId)

    return client?.clientSecret?.toLowerCase() === clientSecret.toLowerCase()
  }
}

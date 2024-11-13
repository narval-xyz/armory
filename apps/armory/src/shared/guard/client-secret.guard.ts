import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, secret } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { ClientService } from '../../client/core/service/client.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class ClientSecretGuard implements CanActivate {
  constructor(private clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientSecret = req.headers[REQUEST_HEADER_CLIENT_SECRET]
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    if (!clientSecret) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_SECRET} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    return client?.clientSecret === secret.hash(clientSecret)
  }
}

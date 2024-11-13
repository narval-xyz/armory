import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { ClientService } from '../../client/core/service/client.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class ClientIdGuard implements CanActivate {
  constructor(private clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new ApplicationException({
        message: `Client not found for ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    return true
  }
}

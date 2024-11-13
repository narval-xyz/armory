import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, secret } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { ClientService } from '../../../client/core/service/client.service'
import { ApplicationException } from '../../../shared/exception/application.exception'

@Injectable()
export class DataStoreGuard implements CanActivate {
  constructor(private clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const clientId = req.query.clientId || req.headers[REQUEST_HEADER_CLIENT_ID]
    const clientSecret = req.headers[REQUEST_HEADER_CLIENT_SECRET]
    const dataSecret = req.query.dataSecret

    if (!clientId) {
      throw new ApplicationException({
        message: 'Missing clientId',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    if (!clientSecret && !dataSecret) {
      throw new ApplicationException({
        message: 'Missing clientSecret or dataSecret',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    if (clientSecret) {
      return client?.clientSecret === secret.hash(clientSecret)
    }

    return client?.dataSecret === secret.hash(dataSecret)
  }
}

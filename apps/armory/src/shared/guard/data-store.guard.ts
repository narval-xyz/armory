import { secret } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET } from '../../armory.constant'
import { ClientService } from '../../client/core/service/client.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class DataStoreGuard implements CanActivate {
  constructor(private clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const clientId = req.query.clientId || req.headers[REQUEST_HEADER_CLIENT_ID]
    const clientSecret = req.headers[REQUEST_HEADER_CLIENT_SECRET]
    const dataApiKey = req.query.dataApiKey

    if (!clientId) {
      throw new ApplicationException({
        message: 'Missing clientId',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    if (!clientSecret && !dataApiKey) {
      throw new ApplicationException({
        message: 'Missing clientSecret or dataApiKey',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    if (clientSecret) {
      return client?.clientSecret === secret.hash(clientSecret)
    }

    return client?.dataApiKey === secret.hash(dataApiKey)
  }
}

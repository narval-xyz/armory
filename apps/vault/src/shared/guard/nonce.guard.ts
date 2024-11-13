import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { get } from 'lodash/fp'
import { NonceService } from '../../vault/core/service/nonce.service'
import { ApplicationException } from '../exception/application.exception'

@Injectable()
export class NonceGuard implements CanActivate {
  constructor(private nonceService: NonceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const nonce = this.getNonce(req)
    const clientId = this.getClientId(req)

    if (await this.nonceService.exist(clientId, nonce)) {
      throw new ApplicationException({
        message: 'Nonce already used',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN,
        context: { clientId, nonce }
      })
    }

    return true
  }

  private getNonce(req: Request): string {
    const nonce = get(['body', 'request', 'nonce'], req)

    if (!nonce) {
      throw new ApplicationException({
        message: 'Missing request nonce',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    return nonce
  }

  private getClientId(req: Request): string {
    const clientId = get(['headers', REQUEST_HEADER_CLIENT_ID], req)

    if (Array.isArray(clientId)) {
      throw new ApplicationException({
        message: `Invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }

    return clientId
  }
}

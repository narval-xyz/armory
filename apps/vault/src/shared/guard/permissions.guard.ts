import { Permission } from '@narval/policy-engine-shared'
import { JwtVerifyOptions, PublicKey, verifyJwt } from '@narval/signature'
import { CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ClientService } from '../../client/core/service/client.service'
import { REQUEST_ADMIN_TOKEN, REQUEST_HEADER_CLIENT_ID } from '../../main.constant'
import { Permissions } from '../decorator/permissions.decorator'
import { ApplicationException } from '../exception/application.exception'
import { Client } from '../type/domain.type'

export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private clientService: ClientService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const permissions = this.reflector.get(Permissions, context.getHandler())

    if (!permissions) {
      return true
    }

    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findByClientId(clientId)
    const adminToken = req.headers[REQUEST_ADMIN_TOKEN]

    return this.validateToken(permissions, adminToken, client)
  }

  private async validateToken(permissions: Permission[], token: string, client: Client | null): Promise<boolean> {
    if (!client?.engineJwk) {
      throw new ApplicationException({
        message: 'No engine key configured',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const clientJwk: PublicKey = client.engineJwk

    const opts: JwtVerifyOptions = {
      access: [
        {
          resource: 'vault',
          permissions
        }
      ]
    }

    await verifyJwt(token, clientJwk, opts).catch((err) => {
      throw new ApplicationException({
        message: err.message,
        origin: err,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    })

    return true
  }
}

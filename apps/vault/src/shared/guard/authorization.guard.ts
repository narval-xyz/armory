import { PublicKey, verifyJwsd, verifyJwt } from '@narval/signature'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { z } from 'zod'
import { REQUEST_HEADER_CLIENT_ID } from '../../main.constant'
import { TenantService } from '../../tenant/core/service/tenant.service'
import { ApplicationException } from '../exception/application.exception'

const AuthorizationHeaderSchema = z.object({
  authorization: z.string()
})

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]
    const headers = AuthorizationHeaderSchema.parse(req.headers)
    // Expect the header in the format "GNAP <token>"
    const accessToken: string | undefined = headers.authorization.split('GNAP ')[1]

    if (!accessToken) {
      throw new ApplicationException({
        message: `Missing or invalid Access Token in Authorization header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const tenant = await this.tenantService.findByClientId(clientId)
    if (!tenant?.engineJwk) {
      throw new ApplicationException({
        message: 'No engine key configured',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED,
        context: {
          clientId
        }
      })
    }
    const isAuthorized = await this.validateToken(context, accessToken, tenant?.engineJwk)

    return isAuthorized
  }

  async validateToken(context: ExecutionContext, token: string, tenantJwk: PublicKey): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const request = req.body.request

    // Validate the JWT has a valid signature for the expected tenant key & the request matches
    const { payload } = await verifyJwt(token, tenantJwk, {
      maxTokenAge: 60, // Verify the token is not older than 60s
      requestHash: request
    }).catch((err) => {
      throw new ApplicationException({
        message: err.message,
        origin: err,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    })

    // We want to also check the client key in cnf so we can optionally do bound requests
    if (payload.cnf) {
      const boundKey = payload.cnf
      const jwsdHeader = req.headers['detached-jws']
      if (!jwsdHeader) {
        throw new ApplicationException({
          message: `Missing detached-jws header`,
          suggestedHttpStatusCode: HttpStatus.FORBIDDEN
        })
      }

      // Will throw if not valid
      try {
        await verifyJwsd(jwsdHeader, boundKey, {
          requestBody: req.body, // Verify the request body
          accessToken: token, // Verify that the ATH matches the access token
          uri: `https://armory.narval.xyz${req.url}`, // Verify the request URI // TODO: base url should be dynamic
          htm: req.method, // Verify the request method
          maxTokenAge: 60 // Verify the token is not older than 60 seconds
        })
      } catch (err) {
        throw new ApplicationException({
          message: err.message,
          origin: err,
          suggestedHttpStatusCode: HttpStatus.FORBIDDEN
        })
      }
    }

    // Then we sign.

    return true
  }
}

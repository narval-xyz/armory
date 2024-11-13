import { ConfigService } from '@narval/config-module'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { JwtVerifyOptions, publicKeySchema, verifyJwsd, verifyJwt } from '@narval/signature'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { z } from 'zod'
import { ClientService } from '../../client/core/service/client.service'
import { Config } from '../../main.config'
import { PermissionGuard } from '../decorator/permission-guard.decorator'
import { ApplicationException } from '../exception/application.exception'
import { Client } from '../type/domain.type'

const AuthorizationHeaderSchema = z.object({
  authorization: z.string()
})

const ONE_MINUTE = 60

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService<Config>,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    // Expect the header in the format "GNAP <token>"
    const headers = AuthorizationHeaderSchema.parse(req.headers)
    const accessToken: string | undefined = headers.authorization.split('GNAP ')[1]

    if (!accessToken) {
      throw new ApplicationException({
        message: `Missing or invalid Access Token in Authorization header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    if (!client) {
      throw new ApplicationException({
        message: 'Client not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const { request: requestHash } = req.body
    const permissions = this.reflector.get(PermissionGuard, context.getHandler())
    const access =
      permissions && permissions.length > 0
        ? [
            {
              resource: 'vault',
              permissions
            }
          ]
        : undefined

    const opts: JwtVerifyOptions = {
      audience: client.audience,
      issuer: client.issuer,
      maxTokenAge: client.maxTokenAge,
      allowWildcard: client.allowWildcard,
      ...(requestHash && { requestHash }),
      ...(access && { access })
    }

    return this.validateToken(context, client, accessToken, opts)
  }

  private async validateToken(
    context: ExecutionContext,
    client: Client,
    token: string,
    opts: JwtVerifyOptions
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    if (!client.engineJwk) {
      throw new ApplicationException({
        message: 'No engine key configured',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const clientJwk = publicKeySchema.parse(client.engineJwk)

    // Validate the JWT has a valid signature for the expected client key & the request matches
    const { payload } = await verifyJwt(token, clientJwk, opts).catch((err) => {
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
        const defaultBaseUrl = this.configService.get('baseUrl')
        await verifyJwsd(jwsdHeader, boundKey, {
          requestBody: req.body, // Verify the request body
          accessToken: token, // Verify that the ATH matches the access token
          uri: `${client.baseUrl || defaultBaseUrl}${req.url}`, // Verify the request URI
          htm: req.method, // Verify the request method
          maxTokenAge: ONE_MINUTE
        })
      } catch (err) {
        throw new ApplicationException({
          message: err.message,
          origin: err,
          suggestedHttpStatusCode: HttpStatus.FORBIDDEN
        })
      }
    }

    return true
  }
}

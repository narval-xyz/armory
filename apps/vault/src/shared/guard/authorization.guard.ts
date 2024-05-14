import { JwtVerifyOptions, PublicKey, verifyJwsd, verifyJwt } from '@narval/signature'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'
import { ClientService } from '../../client/core/service/client.service'
import { Config } from '../../main.config'
import { REQUEST_HEADER_CLIENT_ID } from '../../main.constant'
import { ApplicationException } from '../exception/application.exception'
import { Client } from '../type/domain.type'

const AuthorizationHeaderSchema = z.object({
  authorization: z.string()
})

const DEFAULT_MAX_TOKEN_AGE = 60

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService<Config, true>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const clientId = req.headers[REQUEST_HEADER_CLIENT_ID]
    const headers = AuthorizationHeaderSchema.parse(req.headers)

    if (!clientId) {
      throw new ApplicationException({
        message: `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const client = await this.clientService.findById(clientId)

    // Expect the header in the format "GNAP <token>"
    const accessToken: string | undefined = headers.authorization.split('GNAP ')[1]

    if (!accessToken) {
      throw new ApplicationException({
        message: `Missing or invalid Access Token in Authorization header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }
    const isAuthorized = await this.validateToken(context, accessToken, client)

    return isAuthorized
  }

  async validateToken(context: ExecutionContext, token: string, client: Client | null): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const request = req.body.request
    if (!client?.engineJwk) {
      throw new ApplicationException({
        message: 'No engine key configured',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }
    const clientJwk: PublicKey = client?.engineJwk
    const opts: JwtVerifyOptions = {
      audience: client?.audience,
      issuer: client?.issuer,
      maxTokenAge: client?.maxTokenAge || DEFAULT_MAX_TOKEN_AGE
    }

    // Validate the JWT has a valid signature for the expected client key & the request matches
    const { payload } = await verifyJwt(token, clientJwk, {
      ...opts,
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
        const defaultBaseUrl = this.configService.get('baseUrl', { infer: true })
        await verifyJwsd(jwsdHeader, boundKey, {
          requestBody: req.body, // Verify the request body
          accessToken: token, // Verify that the ATH matches the access token
          uri: `${client.baseUrl || defaultBaseUrl}${req.url}`, // Verify the request URI
          htm: req.method, // Verify the request method
          maxTokenAge: DEFAULT_MAX_TOKEN_AGE
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

import { ConfigService } from '@narval/config-module'
import { LoggerService, REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { Jwsd, JwtVerifyOptions, PublicKey, publicKeySchema, verifyJwsd, verifyJwt } from '@narval/signature'
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { z } from 'zod'
import { ClientService } from '../../client/core/service/client.service'
import { Config } from '../../main.config'
import { RequiredPermission } from '../decorator/permission-guard.decorator'
import { ApplicationException } from '../exception/application.exception'
import { Client, VaultPermission } from '../type/domain.type'

// Option 2: Add validation with custom message
const AuthorizationHeaderSchema = z.object({
  authorization: z.string({
    required_error: 'Authorization header is required',
    invalid_type_error: 'Authorization header must be a string'
  })
})

const ONE_MINUTE = 60

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private clientService: ClientService,
    private configService: ConfigService<Config>,
    private reflector: Reflector,
    private logger: LoggerService
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

    const client = await this.clientService.findById(clientId)
    if (!client) {
      throw new ApplicationException({
        message: 'Client not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    if (client?.auth.disabled) {
      this.logger.warn('Client auth disabled -- all request will be permitted')
      return true
    }

    if (client?.auth.tokenValidation.disabled) {
      this.logger.warn('Client token validation disabled -- auth tokens will not be required')
      // TODO: should we not return, in case AuthN is used w/out validation?

      // TODO: add JWKS as an option instead of allowedUsers
      const allowedUsers = client.auth.local?.allowedUsers
      if (!allowedUsers?.length) {
        // JWT Validation is disabled, but Auth is enabled; then we MUST have an allow-list of user keys
        throw new ApplicationException({
          message: 'No allowed users configured for client',
          suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
        })
      }

      // Try each allowed user's public key until we find one that validates
      let validJwsd: Jwsd | undefined
      for (const user of allowedUsers) {
        try {
          validJwsd = await this.validateJwsdAuthentication(context, client, user.publicKey)
          break
        } catch (err) {
          // Continue trying other keys
          this.logger.warn('Invalid request signature, but could have another allowedUser key', { error: err })
          continue
        }
      }

      if (!validJwsd) {
        throw new ApplicationException({
          message: 'Invalid request signature',
          suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
        })
      }

      return true
    }

    // Validate the Access Token.

    // Expect the header in the format "GNAP <token>"
    const headers = AuthorizationHeaderSchema.parse(req.headers)
    const accessToken: string | undefined = headers.authorization.split('GNAP ')[1]

    if (!accessToken) {
      throw new ApplicationException({
        message: `Missing or invalid Access Token in Authorization header`,
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    // Get the Permissions (scopes) required from the request decorator, if it exists.
    const { request: requestHash } = req.body
    const permissions: VaultPermission[] | undefined = this.reflector.get(RequiredPermission, context.getHandler())
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
      audience: client.auth.tokenValidation.verification.audience,
      issuer: client.auth.tokenValidation.url,
      maxTokenAge: client.auth.tokenValidation.verification.maxTokenAge,
      allowWildcard: client.auth.tokenValidation.verification.allowWildcard,
      ...(requestHash && { requestHash }),
      ...(access && { access })
    }

    return this.validateToken(context, client, accessToken, opts)
  }

  private async validateJwsdAuthentication(
    context: ExecutionContext,
    client: Client,
    publicKey: PublicKey,
    accessToken?: string
  ): Promise<Jwsd> {
    const req = context.switchToHttp().getRequest()

    // TODO: support httpsig proof
    const jwsdHeader = req.headers['detached-jws']

    if (!jwsdHeader) {
      throw new ApplicationException({
        message: `Missing detached-jws header`,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    // Will throw if not valid
    try {
      // TODO: add optionality for requiredComponents; for now, we always require all the jwsd claims (htm, uri, created, ath)
      const defaultBaseUrl = this.configService.get('baseUrl')
      const jwsd = await verifyJwsd(jwsdHeader, publicKey, {
        requestBody: req.body, // Verify the request body
        accessToken, // Verify that the ATH matches the access token
        uri: `${(client.baseUrl || defaultBaseUrl).replace(/\/+$/, '')}${req.url.replace(/^\/+/, '/')}`, // Verify the request URI; ensure proper url joining
        htm: req.method, // Verify the request method
        maxTokenAge: client.auth.local?.jwsd.maxAge || ONE_MINUTE
      })

      return jwsd
    } catch (err) {
      throw new ApplicationException({
        message: err.message,
        origin: err,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }
  }

  private async validateToken(
    context: ExecutionContext,
    client: Client,
    token: string,
    opts: JwtVerifyOptions
  ): Promise<boolean> {
    if (!client.auth.tokenValidation.pinnedPublicKey) {
      // TODO: check jwksUrl too
      // TODO: check opaque token; ping the auth server to check validity
      throw new ApplicationException({
        message: 'No engine key configured',
        suggestedHttpStatusCode: HttpStatus.UNAUTHORIZED
      })
    }

    const pinnedPublicKey = publicKeySchema.parse(client.auth.tokenValidation.pinnedPublicKey)

    // Validate the JWT has a valid signature for the expected client key & the request matches
    const { payload } = await verifyJwt(token, pinnedPublicKey, opts).catch((err) => {
      throw new ApplicationException({
        message: err.message,
        origin: err,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    })

    // Signed Request / Bound Token ->>
    // If the client has `requireBoundTokens` set, OR if the token has a `cnf` field, the request MUST include a proof of key possession
    // If `requireBoundTokens` is set but the token does not have a `cnf`, we consider this _invalid_, because we won't accept unbound tokens.
    // This means that this server can only accept bound tokens, and/or the auth server can issue a bound token that shouldn't be accepted without proof.

    if (client.auth.tokenValidation.verification.requireBoundTokens && !payload.cnf) {
      throw new ApplicationException({
        message: 'Access Token must be bound to a key referenced in the cnf claim',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    // We don't require it here, but if the token is bound (cnf claim) then we must verify the request includes a proof of key possession
    if (payload.cnf) {
      const boundKey = payload.cnf

      await this.validateJwsdAuthentication(context, client, boundKey, token)
      // Valid!
    }

    return true
  }
}

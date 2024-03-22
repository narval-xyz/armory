import { PublicKey, hash, hexToBase64Url, verifyJwsd, verifyJwt } from '@narval/signature'
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
    // 1. Validate the JWT has a valid signature for the expected tenant key
    const { payload } = await verifyJwt(token, tenantJwk)
    // console.log('Validated', { header, payload })

    // 2. Validate the TX Request sent is the same as the one in the JWT
    const req = context.switchToHttp().getRequest()
    const request = req.body.request
    const verificationMsg = hash(request)
    const requestMatches = payload.requestHash === verificationMsg
    if (!requestMatches) {
      throw new ApplicationException({
        message: `Request payload does not match the authorized request`,
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    // 3. Validate that the JWT has all the corerct properties, claims, etc.
    // This belongs in the signature lib, but needs to accept a options obj like jose does.
    // We probs have to roll our own simply so we can support EIP191
    // const v = await jwtVerify(token, await importJWK(tenantJwk))
    // console.log('JWT Verified', v)

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

      const parts = jwsdHeader.split('.')
      const deepCopyBody = JSON.parse(JSON.stringify(req.body))
      // This is the GNAP spec; base64URL the sha256 of the whole request body (not just our tx body.request part)
      const jwsdPayload = hexToBase64Url(`0x${hash(deepCopyBody)}`)
      // Replace the payload part; this lets the JWT be compacted with `header..signature` to be shorter.
      parts[1] = jwsdPayload
      const jwsdToVerify = parts.join('.')
      // Will throw if not valid
      try {
        const decodedJwsd = await verifyJwsd(jwsdToVerify, boundKey)
        // Verify the ATH matches our accessToken
        const tokenHash = hexToBase64Url(`0x${hash(token)}`)
        if (decodedJwsd.header.ath !== tokenHash) {
          throw new ApplicationException({
            message: `Request ath does not match the access token`,
            suggestedHttpStatusCode: HttpStatus.FORBIDDEN
          })
        }
      } catch (err) {
        throw new ApplicationException({
          message: err.message,
          suggestedHttpStatusCode: HttpStatus.FORBIDDEN
        })
      }
      // TODO: verify the request URI & such in the jwsd header
    }

    // Then we sign.

    return true
  }
}

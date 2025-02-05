import { applyDecorators } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
import { securityOptions } from '../util/with-swagger.util'

// We support Authentication through a jwsd that does NOT require an access token as well.
// This decorator is simply to flag that a signature is required. If using combined with GNAP, use the api-gnap-security decorator.

export function ApiDetachedJwsSecurity() {
  return applyDecorators(
    ApiSecurity({
      [securityOptions.detachedJws.name]: []
    })
  )
}

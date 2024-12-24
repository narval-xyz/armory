import { applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { REQUEST_HEADER_AUTHORIZATION } from '../constant'
import { securityOptions } from '../util/with-swagger.util'

// GNAP tokens are bound, so they require both the Authorization header and a signature
// We currently only support detached JWS, for key proofs, so we add the `detached-jws` header as well.
// In the future, this can also support httpsig & other key proofing options, making the detached-jws header optional.

export function ApiGnapSecurity(permissions?: string[]) {
  return applyDecorators(
    ApiSecurity({
      [securityOptions.gnap.name]: permissions || [],
      [securityOptions.detachedJws.name]: []
    }),
    // We have to say the Authorization header is required, because the GNAP scheme isn't known by OpenAPI Generator fully, so it won't generate the code to add it.
    ApiHeader({
      name: REQUEST_HEADER_AUTHORIZATION,
      required: false
    })
  )
}

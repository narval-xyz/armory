import { applyDecorators } from '@nestjs/common'
import { ApiHeader } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../constant'

// We support Authentication through a jwsd that does NOT require an access token as well.
// This decorator is simply to flag that a signature is required. If using combined with GNAP, use the api-gnap-security decorator.

export function ApiClientIdHeader() {
  return applyDecorators(
    ApiHeader({
      name: REQUEST_HEADER_CLIENT_ID,
      required: true
    })
  )
}

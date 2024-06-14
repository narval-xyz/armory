import { applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { CLIENT_SECRET_SECURITY, REQUEST_HEADER_CLIENT_ID } from '../../armory.constant'

export function ApiClientId() {
  return applyDecorators(
    ApiSecurity(CLIENT_SECRET_SECURITY.name),
    ApiHeader({
      name: REQUEST_HEADER_CLIENT_ID,
      required: true
    })
  )
}

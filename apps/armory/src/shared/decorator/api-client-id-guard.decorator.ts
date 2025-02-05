import { REQUEST_HEADER_CLIENT_ID, securityOptions } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ClientIdGuard } from '../guard/client-id.guard'

export function ApiClientIdGuard() {
  return applyDecorators(
    UseGuards(ClientIdGuard),
    ApiSecurity(securityOptions.clientId.name),
    ApiHeader({
      name: REQUEST_HEADER_CLIENT_ID,
      required: true
    })
  )
}

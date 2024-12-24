import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, securityOptions } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ClientSecretGuard } from '../guard/client-secret.guard'

export function ClientGuard() {
  return applyDecorators(
    UseGuards(ClientSecretGuard),
    ApiSecurity(securityOptions.clientSecret.name),
    ApiSecurity(securityOptions.clientId.name),
    // IMPORTANT: The order in which you define the headers also determines the
    // order of the function/method arguments in the generated HTTP client.
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_CLIENT_ID
    }),
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_CLIENT_SECRET
    })
  )
}

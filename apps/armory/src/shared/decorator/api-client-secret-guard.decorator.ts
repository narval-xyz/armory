import { REQUEST_HEADER_CLIENT_SECRET, securityOptions } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ClientSecretGuard } from '../guard/client-secret.guard'

export function ApiClientSecretGuard() {
  return applyDecorators(
    UseGuards(ClientSecretGuard),
    ApiSecurity(securityOptions.clientSecret.name),
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_CLIENT_SECRET
    })
  )
}

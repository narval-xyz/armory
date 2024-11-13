import { REQUEST_HEADER_CLIENT_SECRET } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { CLIENT_SECRET_SECURITY } from '../../armory.constant'
import { ClientSecretGuard } from '../guard/client-secret.guard'

export function ApiClientSecretGuard() {
  return applyDecorators(
    UseGuards(ClientSecretGuard),
    ApiSecurity(CLIENT_SECRET_SECURITY.name),
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_CLIENT_SECRET
    })
  )
}

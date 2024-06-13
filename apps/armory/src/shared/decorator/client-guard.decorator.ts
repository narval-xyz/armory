import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { CLIENT_SECRET_SECURITY, REQUEST_HEADER_CLIENT_SECRET } from '../../armory.constant'
import { ClientSecretGuard } from '../guard/client-secret.guard'
import { ApiClientId } from './api-client-id.decorator'

export function ClientGuard() {
  return applyDecorators(
    UseGuards(ClientSecretGuard),
    ApiClientId(),
    ApiSecurity(CLIENT_SECRET_SECURITY.name),
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_CLIENT_SECRET
    })
  )
}

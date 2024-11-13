import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { CLIENT_ID_SECURITY } from '../../armory.constant'
import { ClientIdGuard } from '../guard/client-id.guard'

export function ApiClientIdGuard() {
  return applyDecorators(
    UseGuards(ClientIdGuard),
    ApiSecurity(CLIENT_ID_SECURITY.name),
    ApiHeader({
      name: REQUEST_HEADER_CLIENT_ID,
      required: true
    })
  )
}

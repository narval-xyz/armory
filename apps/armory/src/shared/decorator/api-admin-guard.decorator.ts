import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ADMIN_SECURITY, REQUEST_HEADER_API_KEY } from '../../armory.constant'
import { AdminApiKeyGuard } from '../guard/admin-api-key.guard'

export function ApiAdminGuard() {
  return applyDecorators(
    UseGuards(AdminApiKeyGuard),
    ApiSecurity(ADMIN_SECURITY.name),
    ApiHeader({
      name: REQUEST_HEADER_API_KEY,
      required: true
    })
  )
}

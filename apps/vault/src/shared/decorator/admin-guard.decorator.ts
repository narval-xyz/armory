import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ADMIN_API_KEY_SECURITY, REQUEST_HEADER_API_KEY } from '../../main.constant'
import { AdminApiKeyGuard } from '../guard/admin-api-key.guard'

export function AdminGuard() {
  return applyDecorators(
    UseGuards(AdminApiKeyGuard),
    ApiSecurity(ADMIN_API_KEY_SECURITY.name),
    ApiHeader({
      name: REQUEST_HEADER_API_KEY,
      required: true
    })
  )
}

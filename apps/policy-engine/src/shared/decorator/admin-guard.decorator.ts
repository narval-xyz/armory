import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { ADMIN_SECURITY, REQUEST_HEADER_API_KEY } from '../../policy-engine.constant'
import { AdminApiKeyGuard } from '../guard/admin-api-key.guard'

export function AdminGuard() {
  return applyDecorators(
    UseGuards(AdminApiKeyGuard),
    ApiSecurity(ADMIN_SECURITY.name),
    ApiHeader({
      required: true,
      name: REQUEST_HEADER_API_KEY
    })
  )
}

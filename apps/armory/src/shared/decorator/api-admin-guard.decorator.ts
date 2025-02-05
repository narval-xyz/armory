import { REQUEST_HEADER_ADMIN_API_KEY, securityOptions } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { AdminApiKeyGuard } from '../guard/admin-api-key.guard'

export function ApiAdminGuard() {
  return applyDecorators(
    UseGuards(AdminApiKeyGuard),
    ApiSecurity(securityOptions.adminApiKey.name),
    ApiHeader({
      name: REQUEST_HEADER_ADMIN_API_KEY,
      required: true
    })
  )
}

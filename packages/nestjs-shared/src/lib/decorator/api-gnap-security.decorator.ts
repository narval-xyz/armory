import { applyDecorators } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { gnapSecurity } from '../util/with-swagger.util'

export function ApiGnapSecurity(permissions?: string[]) {
  return applyDecorators(
    ApiSecurity(gnapSecurity().name, permissions),
    ApiHeader({
      name: 'Authorization',
      required: true
    })
  )
}

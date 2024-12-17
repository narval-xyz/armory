import { ApiGnapSecurity } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizationGuard } from '../guard/authorization.guard'
import { VaultPermission } from '../type/domain.type'

const RequiredPermission = Reflector.createDecorator<VaultPermission[]>()

export function PermissionGuard(...permissions: VaultPermission[]) {
  return applyDecorators(RequiredPermission(permissions), UseGuards(AuthorizationGuard), ApiGnapSecurity(permissions))
}

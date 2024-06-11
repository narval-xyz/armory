import { Permission } from '@narval/armory-sdk'
import { ApiGnapSecurity } from '@narval/nestjs-shared'
import { UseGuards, applyDecorators } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizationGuard } from '../guard/authorization.guard'

const RequiredPermission = Reflector.createDecorator<Permission[]>()

export function PermissionGuard(...permissions: Permission[]) {
  return applyDecorators(RequiredPermission(permissions), UseGuards(AuthorizationGuard), ApiGnapSecurity(permissions))
}

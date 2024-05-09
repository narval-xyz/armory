import { Permission } from '@narval/policy-engine-shared'
import { Reflector } from '@nestjs/core'

export const Permissions = Reflector.createDecorator<Permission[]>()

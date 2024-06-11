import { Permission } from '@narval/armory-sdk'
import { Reflector } from '@nestjs/core'

// TODO: BEFORE MERGE: Can I combine it with ApiSecurity?
export const Permissions = Reflector.createDecorator<Permission[]>()

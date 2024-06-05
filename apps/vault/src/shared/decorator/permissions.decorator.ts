import { Permission } from '@narval/armory-sdk'
import { Reflector } from '@nestjs/core'

export const Permissions = Reflector.createDecorator<Permission[]>()

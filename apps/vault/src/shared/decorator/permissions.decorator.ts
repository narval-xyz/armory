import { Permission } from '@narval-xyz/armory-sdk'
import { Reflector } from '@nestjs/core'

export const Permissions = Reflector.createDecorator<Permission[]>()

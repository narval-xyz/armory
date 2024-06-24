import { PublicAccount } from '@narval/armory-sdk'
import { createZodDto } from 'nestjs-zod'

export class AccountDto extends createZodDto(PublicAccount) {}

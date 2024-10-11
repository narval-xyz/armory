import { PublicAccount } from 'apps/vault/src/shared/type/domain.type'
import { createZodDto } from 'nestjs-zod'

export class AccountDto extends createZodDto(PublicAccount) {}

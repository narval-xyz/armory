import { createZodDto } from 'nestjs-zod'
import { PublicAccount } from '../../../../shared/type/domain.type'

export class AccountDto extends createZodDto(PublicAccount) {}

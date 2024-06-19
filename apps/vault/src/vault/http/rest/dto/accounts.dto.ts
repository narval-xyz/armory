import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicAccount } from '../../../../shared/type/domain.type'

export class AccountsDto extends createZodDto(
  z.object({
    accounts: z.array(PublicAccount)
  })
) {}

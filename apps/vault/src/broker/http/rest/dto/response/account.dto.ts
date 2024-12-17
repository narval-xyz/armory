import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Account } from '../../../../core/type/indexed-resources.type'

export class ProviderAccountDto extends createZodDto(
  z.object({
    account: Account
  })
) {}

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Account, Address } from '../../../../core/type/indexed-resources.type'

export class ProviderAccountDto extends createZodDto(
  z.object({
    data: Account.extend({
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      addresses: z.array(
        Address.extend({
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date()
        })
      )
    })
  })
) {}

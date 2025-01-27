import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Account, Address, Wallet } from '../../../../core/type/indexed-resources.type'

export class PaginatedWalletsDto extends createZodDto(
  z.object({
    data: z.array(
      Wallet.extend({
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        accounts: z.array(
          Account.extend({
            createdAt: z.coerce.date(),
            updatedAt: z.coerce.date(),
            addresses: z.array(
              Address.extend({
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date()
              })
            )
          })
        )
      })
    ),
    page: Page
  })
) {}

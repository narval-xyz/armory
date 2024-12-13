import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Account } from '../../../../core/type/indexed-resources.type'

export class PaginatedAccountsDto extends createZodDto(
  z.object({
    accounts: z.array(Account),
    page: Page
  })
) {}

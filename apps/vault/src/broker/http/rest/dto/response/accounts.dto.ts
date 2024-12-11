import { createPaginatedDto } from '@narval/nestjs-shared'
import { z } from 'zod'
import { Account } from '../../../../core/type/indexed-resources.type'
export class PaginatedAccountsDto extends createPaginatedDto(
  z.object({
    accounts: z.array(Account)
  })
) {}

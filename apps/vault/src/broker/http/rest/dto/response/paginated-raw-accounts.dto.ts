import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RawAccount } from '../../../../core/service/raw-account.service'

export class PaginatedRawAccountsDto extends createZodDto(
  z.object({
    data: z.array(RawAccount),
    page: Page
  })
) {}

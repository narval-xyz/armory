import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Wallet } from '../../../../core/type/indexed-resources.type'

export class PaginatedWalletsDto extends createZodDto(
  z.object({
    data: z.array(Wallet),
    page: Page
  })
) {}

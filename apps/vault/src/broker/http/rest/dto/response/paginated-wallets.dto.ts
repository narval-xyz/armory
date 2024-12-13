import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../core/type/indexed-resources.type'

export class PaginatedWalletsDto extends createZodDto(
  z.object({
    wallets: z.array(PublicWallet),
    page: Page
  })
) {}

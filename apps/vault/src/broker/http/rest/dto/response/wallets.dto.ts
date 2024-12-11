import { createPaginatedDto } from '@narval/nestjs-shared'
import { z } from 'zod'
import { PublicWallet } from '../../../../core/type/indexed-resources.type'

export class PaginatedWalletsDto extends createPaginatedDto(
  z.object({
    wallets: z.array(PublicWallet)
  })
) {}

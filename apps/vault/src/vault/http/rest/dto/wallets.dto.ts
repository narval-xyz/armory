import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Wallet } from '../../../../shared/type/domain.type'

export class WalletsDto extends createZodDto(
  z.object({
    wallets: z.array(Wallet)
  })
) {}

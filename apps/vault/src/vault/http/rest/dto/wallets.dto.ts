import { PublicWallet } from '@narval/armory-sdk'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class WalletsDto extends createZodDto(
  z.object({
    wallets: z.array(PublicWallet)
  })
) {}

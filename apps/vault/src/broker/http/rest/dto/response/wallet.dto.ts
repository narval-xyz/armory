import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../core/type/indexed-resources.type'

export class WalletDto extends createZodDto(
  z.object({
    wallet: PublicWallet
  })
) {}

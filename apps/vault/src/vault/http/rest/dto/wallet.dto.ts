import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicAccount } from '../../../../shared/type/domain.type'

export class WalletDto extends createZodDto(
  z.object({
    // TODO: Change to an array because "wallet is a collection of accounts"
    account: PublicAccount,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {}

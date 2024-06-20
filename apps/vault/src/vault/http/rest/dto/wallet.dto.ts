import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicAccount } from '../../../../shared/type/domain.type'

export class WalletDto extends createZodDto(
  z.object({
    account: PublicAccount,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {}

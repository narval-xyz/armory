import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../shared/type/domain.type'

export class DeriveWalletDto extends createZodDto(
  z.object({
    keyId: z.string(),
    count: z.number().optional().default(1),
    derivationPaths: z.array(z.string()).optional()
  })
) {}

export class DeriveWalletResponseDto extends createZodDto(
  z.object({
    wallets: z.array(PublicWallet)
  })
) {}

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../shared/type/domain.type'

export class DeriveWalletDto extends createZodDto(
  z.object({
    keyId: z.string(),
    derivationPaths: z
      .array(
        z.string().refine((path) => path.startsWith('m') || path.startsWith('M'), {
          message: `Derivation path must start with 'm' or 'M'`
        })
      )
      .optional(),
    count: z.number().default(1)
  })
) {}

export class DeriveWalletResponseDto extends createZodDto(
  z.object({
    wallets: z.array(PublicWallet)
  })
) {}

import { PublicWallet } from '@narval/armory-sdk'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class DeriveWalletDto extends createZodDto(
  z.object({
    keyId: z.string(),
    derivationPaths: z
      .array(
        z.string().startsWith('m', {
          message: `Derivation path must start with 'm'`
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

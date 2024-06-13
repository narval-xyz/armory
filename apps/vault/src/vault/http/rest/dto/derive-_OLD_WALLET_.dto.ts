import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { _OLD_PUBLIC_WALLET_ } from '../../../../shared/type/domain.type'

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
    _OLD_WALLETS_: z.array(_OLD_PUBLIC_WALLET_)
  })
) {}

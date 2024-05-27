import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { DerivationPath, Wallet } from '../../../../shared/type/domain.type'

export class DeriveWalletDto extends createZodDto(
  z.object({
    keyId: z.string(),
    derivationPaths: z.array(DerivationPath)
  })
) {}

export class DeriveWalletResponseDto extends createZodDto(
  z.object({
    wallets: z.union([z.array(Wallet), Wallet])
  })
) {
  constructor(wallets: Wallet[] | Wallet) {
    super()
    this.wallets = wallets
  }
}

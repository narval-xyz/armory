import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PrivateWallet, PublicWallet } from '../../../../shared/type/domain.type'

export class DeriveWalletDto extends createZodDto(
  z.object({
    rootKeyId: z.string(),
    derivations: z.number().optional().default(1),
    derivationPaths: z.array(z.string()).optional()
  })
) {}

export class DeriveWalletResponseDto extends createZodDto(
  z.object({
    wallets: z.union([z.array(PublicWallet), PublicWallet])
  })
) {
  constructor(wallets: PrivateWallet[] | PrivateWallet) {
    super()
    this.wallets = Array.isArray(wallets)
      ? wallets.map((wallet) => PublicWallet.parse(wallet))
      : PublicWallet.parse(wallets)
  }
}

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { DerivationPath, PrivateWallet, PublicWallet } from '../../../../shared/type/domain.type'
import { privateToPublicWallet } from '../../../core/util/private-to-public-wallet'

export class DeriveWalletDto extends createZodDto(
  z.object({
    keyId: z.string(),
    derivationPaths: z.array(DerivationPath)
  })
) {}

export class DeriveWalletResponseDto extends createZodDto(
  z.object({
    wallets: z.union([z.array(PublicWallet), PublicWallet])
  })
) {
  constructor(wallets: PrivateWallet[] | PrivateWallet) {
    super()
    this.wallets = Array.isArray(wallets) ? wallets.map(privateToPublicWallet) : privateToPublicWallet(wallets)
  }
}

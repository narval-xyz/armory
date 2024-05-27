import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PrivateWallet, PublicWallet } from '../../../../shared/type/domain.type'
import { privateToPublicWallet } from '../../../core/util/private-to-public-wallet'

export class GenerateKeyResponseDto extends createZodDto(
  z.object({
    wallet: PublicWallet,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {
  constructor({ wallet, backup, keyId }: { wallet: PrivateWallet; backup?: string; keyId: string }) {
    super()
    this.backup = backup
    this.wallet = privateToPublicWallet(wallet)
    this.keyId = keyId
  }
}

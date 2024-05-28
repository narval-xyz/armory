import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PrivateWallet, PublicWallet } from '../../../../shared/type/domain.type'

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
    this.wallet = PublicWallet.parse(wallet)
    this.keyId = keyId
  }
}

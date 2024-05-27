import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserFacingWallet } from '../../../../shared/type/domain.type'

export class GenerateKeyResponseDto extends createZodDto(
  z.object({
    wallet: UserFacingWallet,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {
  constructor({ wallet, backup, keyId }: { wallet: UserFacingWallet; backup?: string; keyId: string }) {
    super()
    this.backup = backup
    this.wallet = wallet
    this.keyId = keyId
  }
}

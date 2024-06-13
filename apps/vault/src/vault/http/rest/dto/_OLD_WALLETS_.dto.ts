import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { _OLD_PUBLIC_WALLET_ } from '../../../../shared/type/domain.type'

export class WalletsDto extends createZodDto(
  z.object({
    _OLD_WALLETS_: z.array(_OLD_PUBLIC_WALLET_)
  })
) {}

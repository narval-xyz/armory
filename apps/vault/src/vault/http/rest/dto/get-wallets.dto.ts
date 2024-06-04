import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../shared/type/domain.type'

export const GetWalletsDto = createZodDto(
  z.object({
    wallets: z.array(PublicWallet)
  })
)

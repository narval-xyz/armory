import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Wallet } from '../../../../core/type/indexed-resources.type'

export class ProviderWalletDto extends createZodDto(
  z.object({
    data: Wallet
  })
) {}

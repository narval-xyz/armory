import { Curves } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Curve } from '../../../../shared/type/domain.type'

export class GenerateWalletDto extends createZodDto(
  z.object({
    curve: Curve.optional().default(Curves.SECP256K1),
    keyId: z.string().optional()
  })
) {}

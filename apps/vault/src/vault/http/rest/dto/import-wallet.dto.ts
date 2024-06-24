import { Curves } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Curve } from '../../../../shared/type/domain.type'

export class ImportWalletDto extends createZodDto(
  z.object({
    keyId: z.string().optional(),
    curve: Curve.default(Curves.SECP256K1),
    encryptedSeed: z.string()
  })
) {}

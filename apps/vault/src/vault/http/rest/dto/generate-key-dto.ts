import { Alg, Curves } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class GenerateKeyDto extends createZodDto(
  z.object({
    curve: z.literal(Curves.SECP256K1).optional(),
    alg: z.literal(Alg.ES256K).optional(),
    keyId: z.string().optional()
  })
) {}

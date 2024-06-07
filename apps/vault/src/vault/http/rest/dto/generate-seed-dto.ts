import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Algorithm, Curve } from '../../../../shared/type/domain.type'

export class GenerateSeedDto extends createZodDto(
  z.object({
    curve: Curve.optional(),
    alg: Algorithm.optional(),
    keyId: z.string().optional()
  })
) {}

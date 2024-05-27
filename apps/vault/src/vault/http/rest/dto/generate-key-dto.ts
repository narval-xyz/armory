import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class GenerateKeyDto extends createZodDto(
  z.object({
    curve: z.string().optional(),
    alg: z.string().optional(),
    keyId: z.string().optional()
  })
) {}

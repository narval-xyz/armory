import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class ImportSeedDto extends createZodDto(
  z.object({
    keyId: z.string().optional(),
    encryptedSeed: z.string()
  })
) {}

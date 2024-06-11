import { hexSchema } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SignatureDto extends createZodDto(
  z.object({
    signature: hexSchema
  })
) {}

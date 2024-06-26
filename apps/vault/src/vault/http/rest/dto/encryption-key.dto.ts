import { createZodDto } from 'nestjs-zod'
import { rsaPublicKeySchema } from 'packages/signature/src/lib/schemas'
import { z } from 'zod'

export class EncryptionKeyDto extends createZodDto(
  z.object({
    publicKey: rsaPublicKeySchema
  })
) {}

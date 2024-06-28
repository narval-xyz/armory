import { rsaPublicKeySchema } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class EncryptionKeyDto extends createZodDto(
  z.object({
    publicKey: rsaPublicKeySchema
  })
) {}

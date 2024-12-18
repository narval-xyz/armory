import { publicKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class EncryptionKeyDto extends createZodDto(
  z.object({
    /**
     * @deprecated Use `data.jwk` instead. Requires Vault encryption flows to
     * move from `publicKey` to `data.jwk`.
     */
    publicKey: rsaPublicKeySchema.describe('(DEPRECATED: use data.jwk instead) JWK format of the public key'),
    data: z.object({
      keyId: z.string().optional(),
      jwk: publicKeySchema.optional().describe('JWK format of the public key'),
      pem: z.string().optional().describe('Base64url encoded PEM public key')
    })
  })
) {}

import { hexSchema } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PendingConnection } from '../../../../core/type/connection.type'

export class ProviderPendingConnectionDto extends createZodDto(
  z.object({
    data: PendingConnection.pick({
      clientId: true,
      connectionId: true,
      provider: true,
      status: true,
      createdAt: true
    }).extend({
      publicKey: z
        .object({
          keyId: z.string().optional(),
          jwk: publicKeySchema.optional(),
          hex: hexSchema.optional(),
          csr: z
            .string()
            .optional()
            .describe('Certificate Signing Request PEM format of RSA public key encoded as base64')
        })
        .optional(),
      encryptionPublicKey: z.object({
        keyId: z.string().optional(),
        jwk: publicKeySchema.optional().describe('JWK format of the public key'),
        pem: z.string().optional().describe('Base64url encoded PEM public key')
      })
    })
  })
) {}

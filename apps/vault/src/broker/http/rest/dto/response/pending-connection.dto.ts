import { hexSchema } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PendingConnection } from '../../../../core/type/connection.type'

export class PendingConnectionDto extends createZodDto(
  PendingConnection.pick({
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
        hex: hexSchema.optional()
      })
      .optional(),
    encryptionPublicKey: z.object({
      keyId: z.string().optional(),
      jwk: publicKeySchema.optional()
    })
  })
) {}

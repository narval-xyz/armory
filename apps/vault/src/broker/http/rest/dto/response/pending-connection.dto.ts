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
    encryptionPublicKey: true,
    createdAt: true
  }).extend({
    credentials: z.object({
      publicKey: publicKeySchema.optional()
    })
  })
) {}

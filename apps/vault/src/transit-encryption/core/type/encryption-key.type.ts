import { rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const EncryptionKey = z.object({
  clientId: z.string(),
  publicKey: rsaPublicKeySchema,
  privateKey: rsaPrivateKeySchema,
  createdAt: z.date()
})
export type EncryptionKey = z.infer<typeof EncryptionKey>

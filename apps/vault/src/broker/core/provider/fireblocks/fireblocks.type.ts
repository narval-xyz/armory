import { rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const FireblocksInputCredentials = z.object({
  apiKey: z.string(),
  privateKey: z.string().optional().describe('RSA private key pem base64 encoded')
})
export type FireblocksInputCredentials = z.infer<typeof FireblocksInputCredentials>

export const FireblocksCredentials = z.object({
  apiKey: z.string().optional(),
  publicKey: rsaPublicKeySchema,
  privateKey: rsaPrivateKeySchema
})
export type FireblocksCredentials = z.infer<typeof FireblocksCredentials>

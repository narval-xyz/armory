import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { privateKeySchema, publicKeySchema } from '@narval/signature'

import { z } from 'zod'

export const SignerFunction = z.function().args(z.string()).returns(z.promise(z.string()))
export type SignerFunction = z.infer<typeof SignerFunction>

export const SignerConfig = z.object({
  publicKey: publicKeySchema.optional(),
  privateKey: privateKeySchema.optional(),
  keyId: z.string().optional().describe('Unique id of the signer key. Matches the kid in both jwks'),
  signer: SignerFunction.optional()
})

export type SignerConfig = z.infer<typeof SignerConfig>

export const Client = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),
  signer: SignerConfig,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Client = z.infer<typeof Client>

export const Engine = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1).optional(),
  masterKey: z.string().min(1).optional()
})
export type Engine = z.infer<typeof Engine>

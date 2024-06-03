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

export const PublicClient = Client.extend({
  signer: z.object({
    publicKey: publicKeySchema
  })
})
export type PublicClient = z.infer<typeof PublicClient>

export const CreateClient = z.object({
  clientId: z.string().optional(),
  clientSecret: z
    .string()
    .min(1)
    .optional()
    .describe('a secret to be used to authenticate the client, sha256 hex-encoded. If null, will be generated.'), // can be generated with `echo -n "my-api-key" | openssl dgst -sha256 | awk '{print $2}'`
  keyId: z.string().optional().describe('A unique identifier for key that will be used to sign JWTs'),
  entityDataStore: DataStoreConfiguration,
  policyDataStore: DataStoreConfiguration
})
export type CreateClient = z.infer<typeof CreateClient>

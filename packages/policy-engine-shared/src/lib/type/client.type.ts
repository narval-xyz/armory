import { privateKeySchema, publicKeySchema } from '@narval/signature'
import { z } from 'zod'
import { DataStoreConfiguration } from './data-store.type'

export const SignerConfig = z.object({
  type: z.literal('PRIVATE_KEY').optional(), // TODO: Remove
  publicKey: publicKeySchema.optional(),
  privateKey: privateKeySchema.optional()
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

export const PublicClient = Client.extend({
  signer: z.object({
    publicKey: publicKeySchema
  })
})
export type PublicClient = z.infer<typeof PublicClient>

export const CreateClient = z.object({
  clientId: z.string().optional(),
  entityDataStore: DataStoreConfiguration,
  policyDataStore: DataStoreConfiguration
})
export type CreateClient = z.infer<typeof CreateClient>

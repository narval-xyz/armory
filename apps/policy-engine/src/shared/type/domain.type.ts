import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { privateKeySchema } from '@narval/signature'

import { z } from 'zod'

export const SignerConfig = z.object({
  type: z.literal('PRIVATE_KEY'),
  key: privateKeySchema
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
  adminApiKey: z.string().min(1),
  masterKey: z.string().min(1).optional()
})
export type Engine = z.infer<typeof Engine>

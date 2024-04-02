import { privateKeySchema } from '@narval/signature'
import { dataStoreConfigurationSchema } from 'packages/policy-engine-shared/src/lib/schema/data-store.schema'
import { z } from 'zod'
import { engineSchema } from '../schema/engine.schema'

export const EngineSignerConfig = z.object({
  type: z.literal('PRIVATE_KEY'),
  key: privateKeySchema
})

export type EngineSignerConfig = z.infer<typeof EngineSignerConfig>

export const Tenant = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  dataStore: z.object({
    entity: dataStoreConfigurationSchema,
    policy: dataStoreConfigurationSchema
  }),
  signer: EngineSignerConfig,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type Tenant = z.infer<typeof Tenant>

export type Engine = z.infer<typeof engineSchema>

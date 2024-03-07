import { dataStoreConfigurationSchema } from 'packages/policy-engine-shared/src/lib/schema/data-store.schema'
import { z } from 'zod'

export const tenantSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  dataStore: z.object({
    entity: dataStoreConfigurationSchema,
    policy: dataStoreConfigurationSchema
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const tenantIndexSchema = z.array(z.string())

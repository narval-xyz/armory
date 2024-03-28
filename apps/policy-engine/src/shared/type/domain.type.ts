import { hexSchema } from '@narval/policy-engine-shared'
import { z } from 'zod'
import { engineSchema } from '../schema/engine.schema'
import { tenantSchema } from '../schema/tenant.schema'

export type Tenant = z.infer<typeof tenantSchema>

export type Engine = z.infer<typeof engineSchema>

export const EngineSignerConfig = z.object({
  type: z.literal('PRIVATE_KEY'),
  privateKey: hexSchema
})

export type EngineSignerConfig = z.infer<typeof EngineSignerConfig>

import { z } from 'zod'
import { engineSchema } from '../schema/engine.schema'
import { tenantSchema } from '../schema/tenant.schema'

export type Tenant = z.infer<typeof tenantSchema>

export type Engine = z.infer<typeof engineSchema>

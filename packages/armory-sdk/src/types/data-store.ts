import { EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const SetEntitiesResponse = z.object({
  data: EntityStore,
  version: z.number(),
  synced: z.boolean()
})
export type SetEntitiesResponse = z.infer<typeof SetEntitiesResponse>

export const SetPoliciesResponse = z.object({
  data: PolicyStore,
  version: z.number(),
  synced: z.boolean()
})
export type SetPoliciesResponse = z.infer<typeof SetPoliciesResponse>

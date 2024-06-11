import { PolicyStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SetPolicyStoreResponse = z.object({
  entity: PolicyStore,
  version: z.number(),
  synced: z.boolean()
})
export type SetPolicyStoreResponse = z.infer<typeof SetPolicyStoreResponse>

export class SetPolicyStoreDto extends createZodDto(PolicyStore) {}

export class SetPolicyStoreResponseDto extends createZodDto(SetPolicyStoreResponse) {}

import { PolicyStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SetPolicyStoreResponse = z.object({
  entity: PolicyStore,
  version: z.number(),
  latestSync: z.object({
    success: z.boolean()
  })
})
export type SetPolicyStoreResponse = z.infer<typeof SetPolicyStoreResponse>

export class SetPolicyStoreDto extends createZodDto(
  z.object({
    policy: PolicyStore
  })
) {}

export class SetPolicyStoreResponseDto extends createZodDto(SetPolicyStoreResponse) {}

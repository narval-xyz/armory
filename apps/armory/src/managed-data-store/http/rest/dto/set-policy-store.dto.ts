import { PolicyStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SetPolicyStoreDto extends createZodDto(PolicyStore) {}

export class SetPolicyStoreResponseDto extends createZodDto(
  z.object({
    policy: PolicyStore,
    version: z.number(),
    latestSync: z.object({
      success: z.boolean()
    })
  })
) {}

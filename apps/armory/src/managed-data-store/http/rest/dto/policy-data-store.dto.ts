import { PolicyStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class PolicyDataStoreDto extends createZodDto(
  z.object({
    policy: PolicyStore
  })
) {}

import { EntityStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class EntityDataStoreDto extends createZodDto(
  z.object({
    entity: EntityStore
  })
) {}

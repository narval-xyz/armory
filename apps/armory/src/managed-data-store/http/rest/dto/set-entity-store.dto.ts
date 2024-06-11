import { EntityStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SetEntityStoreResponse = z.object({
  entity: EntityStore,
  version: z.number(),
  synced: z.boolean()
})
export type SetEntityStoreResponse = z.infer<typeof SetEntityStoreResponse>

export class SetEntityStoreDto extends createZodDto(EntityStore) {}

export class SetEntityStoreResponseDto extends createZodDto(SetEntityStoreResponse) {}

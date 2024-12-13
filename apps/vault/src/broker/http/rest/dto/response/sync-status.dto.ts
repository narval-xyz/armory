import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Sync } from '../../../../core/type/sync.type'

export class SyncStatusDto extends createZodDto(
  z.object({
    started: z.boolean(),
    syncs: z.array(Sync)
  })
) {}

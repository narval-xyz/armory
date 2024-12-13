import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Sync } from '../../../../core/type/sync.type'

export class SyncListDto extends createZodDto(
  z.object({
    syncs: z.array(Sync)
  })
) {}

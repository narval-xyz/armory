import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Sync } from '../../../../core/type/sync.type'

export class SyncDto extends createZodDto(
  z.object({
    data: Sync
  })
) {}

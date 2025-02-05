import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { SyncStarted } from '../../../../core/type/sync.type'

export class SyncStartedDto extends createZodDto(
  z.object({
    data: SyncStarted
  })
) {}

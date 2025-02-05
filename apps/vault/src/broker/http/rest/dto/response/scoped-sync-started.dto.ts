import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ScopedSyncStarted } from '../../../../core/type/scoped-sync.type'

export class ScopedSyncStartedDto extends createZodDto(
  z.object({
    data: ScopedSyncStarted
  })
) {}

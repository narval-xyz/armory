import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ScopedSync } from '../../../../core/type/scoped-sync.type'

export class ScopedSyncDto extends createZodDto(
  z.object({
    data: ScopedSync
  })
) {}

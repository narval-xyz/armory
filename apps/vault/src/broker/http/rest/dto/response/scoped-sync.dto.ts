import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RawAccountSyncFailure, ScopedSync } from '../../../../core/type/scoped-sync.type'

export class ScopedSyncDto extends createZodDto(
  z.object({
    data: ScopedSync.extend({
      failures: z.array(RawAccountSyncFailure)
    })
  })
) {}

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SyncDto extends createZodDto(
  z.object({
    latestSync: z.object({
      success: z.boolean()
    })
  })
) {}

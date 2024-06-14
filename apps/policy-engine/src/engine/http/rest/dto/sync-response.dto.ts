import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SyncResponseDto extends createZodDto(
  z.object({
    success: z.boolean()
  })
) {}

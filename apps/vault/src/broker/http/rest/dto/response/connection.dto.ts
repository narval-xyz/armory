import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class ConnectionDto extends createZodDto(
  z.object({
    connectionId: z.string(),
    clientId: z.string()
  })
) {}

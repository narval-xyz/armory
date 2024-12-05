import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ConnectionStatus } from '../../../../core/type/connection.type'

export class ConnectionDto extends createZodDto(
  z.object({
    connectionId: z.string(),
    clientId: z.string(),
    status: z.nativeEnum(ConnectionStatus)
  })
) {}

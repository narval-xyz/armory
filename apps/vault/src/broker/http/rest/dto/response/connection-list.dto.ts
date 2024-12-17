import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { BaseConnection } from '../../../../core/type/connection.type'

export class ConnectionListDto extends createZodDto(z.object({ connections: z.array(BaseConnection) })) {}

import { createZodDto } from 'nestjs-zod'
import { PendingConnection } from '../../../../core/type/connection.type'

export class PendingConnectionDto extends createZodDto(PendingConnection) {}

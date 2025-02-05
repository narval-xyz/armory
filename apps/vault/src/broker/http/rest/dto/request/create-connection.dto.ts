import { createZodDto } from 'nestjs-zod'
import { CreateConnection } from '../../../../core/type/connection.type'

export class CreateConnectionDto extends createZodDto(CreateConnection) {}

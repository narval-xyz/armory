import { createZodDto } from 'nestjs-zod'
import { InitiateConnection } from '../../../../core/type/connection.type'

export class InitiateConnectionDto extends createZodDto(InitiateConnection) {}

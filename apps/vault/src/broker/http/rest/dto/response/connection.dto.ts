import { createZodDto } from 'nestjs-zod'
import { BaseConnection } from '../../../../core/type/connection.type'

export class ProviderConnectionDto extends createZodDto(BaseConnection) {}

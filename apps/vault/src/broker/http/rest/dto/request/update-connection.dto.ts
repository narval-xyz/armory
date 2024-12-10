import { createZodDto } from 'nestjs-zod'
import { CreateConnection } from '../../../../core/type/connection.type'

export class UpdateConnectionDto extends createZodDto(
  CreateConnection.pick({
    label: true,
    encryptedCredentials: true,
    credentials: true
  })
) {}

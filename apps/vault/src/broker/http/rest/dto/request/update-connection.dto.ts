import { createZodDto } from 'nestjs-zod'
import { UpdateConnection } from '../../../../core/type/connection.type'

export class UpdateConnectionDto extends createZodDto(
  UpdateConnection.omit({
    // These are passed in the route path and request headers.
    connectionId: true,
    clientId: true
  })
) {}

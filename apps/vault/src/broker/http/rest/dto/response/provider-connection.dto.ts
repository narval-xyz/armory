import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Connection } from '../../../../core/type/connection.type'

export class ProviderConnectionDto extends createZodDto(
  z.object({
    data: Connection
  })
) {}

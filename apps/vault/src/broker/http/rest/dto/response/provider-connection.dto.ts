import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { BaseConnection } from '../../../../core/type/connection.type'

export class ProviderConnectionDto extends createZodDto(
  z.object({
    data: BaseConnection
  })
) {}

import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { BaseConnection } from '../../../../core/type/connection.type'

export class PaginatedConnectionsDto extends createZodDto(
  z.object({
    connections: z.array(BaseConnection.omit({ credentials: true })),
    page: Page
  })
) {}

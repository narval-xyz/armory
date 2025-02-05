import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Connection } from '../../../../core/type/connection.type'

export class PaginatedConnectionsDto extends createZodDto(
  z.object({
    data: z.array(Connection),
    page: Page
  })
) {}

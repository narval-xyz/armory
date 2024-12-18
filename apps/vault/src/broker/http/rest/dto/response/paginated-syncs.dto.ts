import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Sync } from '../../../../core/type/sync.type'

export class PaginatedSyncsDto extends createZodDto(
  z.object({
    data: z.array(Sync),
    page: Page
  })
) {}

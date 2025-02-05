import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ScopedSync } from '../../../../core/type/scoped-sync.type'

export class PaginatedScopedSyncsDto extends createZodDto(
  z.object({
    data: z.array(ScopedSync),
    page: Page
  })
) {}

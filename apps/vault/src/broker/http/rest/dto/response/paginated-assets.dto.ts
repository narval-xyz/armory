import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Asset } from '../../../../core/type/asset.type'

export class PaginatedAssetsDto extends createZodDto(
  z.object({
    data: z.array(
      Asset.extend({
        createdAt: z.coerce.date().optional()
      })
    ),
    page: Page
  })
) {}

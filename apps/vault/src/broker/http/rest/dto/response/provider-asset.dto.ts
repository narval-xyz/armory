import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Asset } from '../../../../core/type/asset.type'

export class ProviderAssetDto extends createZodDto(
  z.object({
    data: z.array(Asset),
    page: Page
  })
) {}

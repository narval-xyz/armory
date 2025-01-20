import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Network } from '../../../../core/type/network.type'

export class NetworkDto extends createZodDto(
  z.object({
    data: z.array(
      Network.extend({
        createdAt: z.coerce.date().optional()
      })
    ),
    page: Page
  })
) {}

import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Address } from '../../../../core/type/indexed-resources.type'

export class PaginatedAddressesDto extends createZodDto(
  z.object({
    data: z.array(
      Address.extend({
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date()
      })
    ),
    page: Page
  })
) {}

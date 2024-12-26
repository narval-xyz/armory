import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { KnownDestination } from '../../../../core/type/indexed-resources.type'

export class PaginatedKnownDestinationsDto extends createZodDto(
  z.object({
    data: z.array(KnownDestination),
    page: Page
  })
) {}

import { Page } from '@narval/nestjs-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { KnownDestination as KnownDestinationNext } from '../../../../core/type/known-destination.type'

export class PaginatedKnownDestinationsDto extends createZodDto(
  z.object({
    data: z.array(KnownDestinationNext),
    page: Page
  })
) {}

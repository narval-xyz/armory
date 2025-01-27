import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { KnownDestination } from '../../../../core/type/known-destination.type'

export class KnownDestinationDto extends createZodDto(
  z.object({
    data: KnownDestination
  })
) {}

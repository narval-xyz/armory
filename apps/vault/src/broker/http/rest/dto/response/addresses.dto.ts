import { createPaginatedDto } from '@narval/nestjs-shared'
import { z } from 'zod'
import { Address } from '../../../../core/type/indexed-resources.type'
export class PaginatedAddressesDto extends createPaginatedDto(
  z.object({
    addresses: z.array(Address)
  })
) {}

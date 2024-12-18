import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Address } from '../../../../core/type/indexed-resources.type'

export class ProviderAddressDto extends createZodDto(
  z.object({
    data: Address
  })
) {}

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Address } from '../../../../core/type/indexed-resources.type'

export class AddressDto extends createZodDto(
  z.object({
    address: Address
  })
) {}

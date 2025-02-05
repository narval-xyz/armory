import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { InternalTransfer } from '../../../../core/type/transfer.type'

export class TransferDto extends createZodDto(
  z.object({
    data: InternalTransfer
  })
) {}

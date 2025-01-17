import { createZodDto } from 'nestjs-zod'
import { SendTransfer } from '../../../../core/type/transfer.type'

export class SendTransferDto extends createZodDto(SendTransfer.omit({ transferId: true })) {}

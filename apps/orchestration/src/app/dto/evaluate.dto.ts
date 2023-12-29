import { ApiProperty } from '@nestjs/swagger'
import { TransactionDto } from './transaction.dto'

export class EvaluateDto {
  @ApiProperty()
  tx: TransactionDto
}

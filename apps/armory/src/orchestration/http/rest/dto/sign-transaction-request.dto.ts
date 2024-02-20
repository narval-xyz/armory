import { Action } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'
import { TransactionRequestDto } from '../../../http/rest/dto/transaction-request.dto'

export class SignTransactionRequestDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.SIGN_TRANSACTION
  })
  action: typeof Action.SIGN_TRANSACTION

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsDefined()
  @ValidateNested()
  @ApiProperty({
    type: TransactionRequestDto
  })
  transactionRequest: TransactionRequestDto
}

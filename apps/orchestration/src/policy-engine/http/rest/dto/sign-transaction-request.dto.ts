import { TransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/transaction-request.dto'
import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'

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

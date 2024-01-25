import { TransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/transaction-request.dto'
import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString, ValidateNested } from 'class-validator'

export class SignTransactionRequestDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action,
    default: Action.SIGN_TRANSACTION
  })
  action: Action.SIGN_TRANSACTION

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

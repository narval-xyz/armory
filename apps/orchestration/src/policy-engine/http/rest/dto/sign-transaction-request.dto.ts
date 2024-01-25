import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { TransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/transaction-request.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString, ValidateNested } from 'class-validator'

export class SignTransactionRequestDto {
  @IsEnum(SupportedAction)
  @IsDefined()
  @ApiProperty({
    enum: SupportedAction,
    default: SupportedAction.SIGN_TRANSACTION
  })
  action: SupportedAction.SIGN_TRANSACTION

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

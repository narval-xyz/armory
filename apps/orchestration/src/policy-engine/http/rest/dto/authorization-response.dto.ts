import { AuthorizationRequestStatus, SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { EvaluationDto } from '@app/orchestration/policy-engine/http/rest/dto/evaluation.dto'
import { SignMessageRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-transaction-request.dto'
import { TransactionResponseDto } from '@app/orchestration/policy-engine/http/rest/dto/transaction-request.dto'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'

class SignTransactionResponseDto extends SignTransactionRequestDto {
  // Use a different DTO for the response to ensure the conversion of attributes
  // using bigint back to string.
  @IsDefined()
  @ValidateNested()
  // IMPORTANT: the redundant @Type decorator call with the same DTO from the
  // type is to ensure nested serialization.
  @Type(() => TransactionResponseDto)
  @ApiProperty({
    type: TransactionResponseDto
  })
  transactionRequest: TransactionResponseDto
}

// Nothing different, just keeping naming consistency.
class SignMessageResponseDto extends SignMessageRequestDto {}

// TODO (@wcalderipe, 22/01/24): Missing the authentication attribute.
@ApiExtraModels(SignTransactionResponseDto, SignMessageResponseDto)
export class AuthorizationResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  orgId: string

  @IsString()
  @ApiProperty({
    required: false,
    type: 'string',
    nullable: true
  })
  idempotencyKey?: string | null

  @ApiProperty({
    enum: AuthorizationRequestStatus
  })
  status: `${AuthorizationRequestStatus}`

  @ApiProperty({
    type: [EvaluationDto]
  })
  @Type(() => EvaluationDto)
  evaluations: EvaluationDto[]

  // TODO (@wcalderipe, 22/01/24): Test the discrimination type option from
  // class-transformer instead of a custom function map.
  //
  // See https://github.com/typestack/class-transformer?tab=readme-ov-file#working-with-nested-objects
  @Type((opts) => {
    return opts?.object.request.action === SupportedAction.SIGN_TRANSACTION
      ? SignTransactionResponseDto
      : SignMessageResponseDto
  })
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignMessageResponseDto) }, { $ref: getSchemaPath(SignTransactionResponseDto) }]
  })
  request: SignTransactionResponseDto | SignMessageResponseDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

import { Action } from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { AuthorizationRequestStatus } from '../../../core/type/domain.type'
import { EvaluationDto } from '../../../http/rest/dto/evaluation.dto'
import { SignMessageRequestDto } from '../../../http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '../../../http/rest/dto/sign-transaction-request.dto'
import { TransactionResponseDto } from '../../../http/rest/dto/transaction-request.dto'

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

  @IsDefined()
  @IsString()
  @ApiProperty()
  authentication: string

  @ApiProperty({
    enum: AuthorizationRequestStatus
  })
  status: `${AuthorizationRequestStatus}`

  @Type(() => EvaluationDto)
  @ApiProperty({
    type: EvaluationDto,
    isArray: true
  })
  evaluations: EvaluationDto[]

  // TODO (@wcalderipe, 22/01/24): Test the discrimination type option from
  // class-transformer instead of a custom function map.
  //
  // See https://github.com/typestack/class-transformer?tab=readme-ov-file#working-with-nested-objects
  @Type((opts) => {
    return opts?.object.request.action === Action.SIGN_TRANSACTION ? SignTransactionResponseDto : SignMessageResponseDto
  })
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignMessageResponseDto) }, { $ref: getSchemaPath(SignTransactionResponseDto) }]
  })
  request: SignTransactionResponseDto | SignMessageResponseDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

import { Action } from '@narval/policy-engine-shared'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { AuthorizationRequestStatus } from '../../../core/type/domain.type'
import { EvaluationDto } from '../../../http/rest/dto/evaluation.dto'
import { SignMessageRequestDto } from '../../../http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '../../../http/rest/dto/sign-transaction-request.dto'
import { TransactionResponseDto } from '../../../http/rest/dto/transaction-request.dto'
import { GrantPermissionRequestDto } from './grant-permission-request.dto'

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

class GrantPermissionResponseDto extends GrantPermissionRequestDto {}

// TODO (@wcalderipe, 22/01/24): Missing the authentication attribute.
@ApiExtraModels(SignTransactionResponseDto, SignMessageResponseDto, GrantPermissionResponseDto)
export class AuthorizationResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  clientId: string

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
  @IsDefined()
  @ValidateNested()
  @Type((opts) => {
    switch (opts?.object.request.action) {
      case Action.SIGN_TRANSACTION:
        return SignTransactionResponseDto
      case Action.SIGN_MESSAGE:
        return SignMessageResponseDto
      case Action.GRANT_PERMISSION:
        return GrantPermissionResponseDto
      default:
        return SignTransactionResponseDto
    }
  })
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(SignTransactionResponseDto) },
      { $ref: getSchemaPath(SignMessageResponseDto) },
      { $ref: getSchemaPath(GrantPermissionResponseDto) }
    ]
  })
  request: SignTransactionResponseDto | SignMessageResponseDto | GrantPermissionResponseDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

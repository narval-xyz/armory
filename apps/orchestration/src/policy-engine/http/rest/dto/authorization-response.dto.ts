import { Action, AuthorizationRequestStatus } from '@app/orchestration/policy-engine/core/type/domain.type'
import { EvaluationDto } from '@app/orchestration/policy-engine/http/rest/dto/evaluation.dto'
import { SignMessageRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-message-request.dto'
import { SignTransactionRequestDto } from '@app/orchestration/policy-engine/http/rest/dto/sign-transaction-request.dto'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

/**
 * The transformer function in the "@Transformer" decorator for bigint
 * properties differs between the request and response. This variation is due to
 * the limitations of JS' built-in functions, such as JSON, when handling
 * bigints.
 *
 * - Request: The transformer converts from a string to bigint.
 * - Response: The transformer converts from bigint to a string.
 */
class SignTransactionResponseDto extends SignTransactionRequestDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.toString())
  @ApiProperty({
    type: 'string'
  })
  gas?: bigint
}

// Just for keeping consistency on the naming.
class SignMessageResponseDto extends SignMessageRequestDto {}

@ApiExtraModels(SignTransactionResponseDto, SignMessageResponseDto)
export class AuthorizationResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  orgId: string

  @ApiProperty()
  initiatorId: string

  @IsString()
  @ApiProperty({
    required: false,
    type: 'string',
    nullable: true
  })
  idempotencyKey?: string | null

  @ApiProperty({
    enum: Action
  })
  action: `${Action}`

  @ApiProperty({
    enum: AuthorizationRequestStatus
  })
  status: `${AuthorizationRequestStatus}`

  @ApiProperty({
    description: 'The hash of the request in EIP-191 format.'
  })
  hash: string

  @ApiProperty({
    type: [EvaluationDto]
  })
  @Type(() => EvaluationDto)
  evaluations: EvaluationDto[]

  @Type((opts) => {
    return opts?.object.action === Action.SIGN_TRANSACTION ? SignTransactionResponseDto : SignMessageResponseDto
  })
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(SignMessageResponseDto) }, { $ref: getSchemaPath(SignTransactionResponseDto) }]
  })
  request: SignTransactionResponseDto | SignMessageResponseDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

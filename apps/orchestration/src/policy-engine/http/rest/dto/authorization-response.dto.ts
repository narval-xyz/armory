import { Action, AuthorizationRequestStatus } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  SignMessageRequestDto,
  SignTransactionRequestDto
} from '@app/orchestration/policy-engine/http/rest/dto/authorization-request.dto'
import { EvaluationDto } from '@app/orchestration/policy-engine/http/rest/dto/evaluation.dto'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsString } from 'class-validator'

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
  @Transform(({ value }) => value.toString())
  @ApiProperty({
    type: 'string'
  })
  gas?: bigint
}

// Just for keeping consistency on the naming.
class SignMessageResponseDto extends SignMessageRequestDto {}

export class AuthorizationResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  orgId: string

  @ApiProperty()
  initiatorId: string

  @IsString()
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

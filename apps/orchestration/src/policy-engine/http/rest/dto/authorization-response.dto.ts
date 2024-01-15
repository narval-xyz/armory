import { Action, AuthorizationRequestStatus } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString } from 'class-validator'

export class EvaluationDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  decision: string

  @ApiProperty({
    type: String
  })
  signature?: string | null

  @ApiProperty()
  createdAt: Date
}

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

  // TODO: Figure out the request discrimination. It's been too painful.
  // @ApiProperty({
  //   oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  // })
  // request: SignTransactionRequestDto | SignMessageRequestDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

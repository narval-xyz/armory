import { Action, AuthorizationRequestStatus } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class AuthorizationResponseDto {
  @ApiProperty({
    required: true
  })
  id: string

  @ApiProperty({
    required: true
  })
  orgId: string

  @ApiProperty({
    required: true
  })
  initiatorId: string

  @IsString()
  idempotencyKey?: string | null

  @ApiProperty({
    required: true,
    enum: Action
  })
  action: `${Action}`

  @ApiProperty({
    required: true,
    enum: AuthorizationRequestStatus
  })
  status: `${AuthorizationRequestStatus}`

  @ApiProperty({
    description: 'The hash of the request in EIP-191 format.',
    required: true
  })
  hash: string

  // TODO: Figure out the request discrimination. It's been too painful.
  // @ApiProperty({
  //   oneOf: [{ $ref: getSchemaPath(SignTransactionRequestDto) }, { $ref: getSchemaPath(SignMessageRequestDto) }]
  // })
  // request: SignTransactionRequestDto | SignMessageRequestDto

  constructor(partial: Partial<AuthorizationResponseDto>) {
    Object.assign(this, partial)
  }
}

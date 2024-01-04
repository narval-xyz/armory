import { Decision } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'

class ReasonDto {
  @ApiProperty()
  @IsString()
  code: string

  @ApiProperty()
  @IsString()
  message: string
}

export class AuthorizationResponseDto {
  @ApiProperty({
    enum: Decision
  })
  @IsEnum(Decision)
  decision: Decision

  @ApiProperty({
    type: () => ReasonDto,
    isArray: true
  })
  reasons: ReasonDto[]
}

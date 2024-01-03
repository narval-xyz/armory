import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'
import { Decision } from '../domain.type'

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

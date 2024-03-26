import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsDefined, IsString } from 'class-validator'

export class BaseActionRequestDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  authentication: string

  @IsDefined()
  @ArrayNotEmpty()
  @ApiProperty({
    isArray: true
  })
  approvals: string[]
}

import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class SignMessageRequestDto {
  @IsString()
  @IsDefined()
  @ApiProperty({
    required: true,
    type: 'string'
  })
  message: string
}

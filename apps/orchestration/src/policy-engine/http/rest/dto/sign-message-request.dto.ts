import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class SignMessageRequestDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action,
    default: Action.SIGN_MESSAGE
  })
  action: Action.SIGN_MESSAGE

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string
}

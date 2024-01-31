import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class BaseActionDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action
  })
  action: Action

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string
}

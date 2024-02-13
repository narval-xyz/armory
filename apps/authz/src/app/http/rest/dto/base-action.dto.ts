import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class BaseActionDto {
  @IsEnum(Action)
  @ApiProperty({ enum: Action })
  action: Action

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  nonce: string
}

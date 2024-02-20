import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'
import { Action } from '../type/action.type'

export class BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action)
  })
  action: Action

  @IsString()
  @IsDefined()
  @ApiProperty()
  nonce: string
}

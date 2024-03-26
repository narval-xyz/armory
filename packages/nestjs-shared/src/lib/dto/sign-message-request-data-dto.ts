import { Action } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'
import { BaseActionDto } from './'

export class SignMessageRequestDataDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.SIGN_MESSAGE
  })
  action: typeof Action.SIGN_MESSAGE

  @IsString()
  @IsDefined()
  @ApiProperty()
  resourceId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string // TODO: Is this string hex or raw?
}

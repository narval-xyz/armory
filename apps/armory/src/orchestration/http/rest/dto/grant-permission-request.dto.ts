import { IsNotEmptyArrayString } from '@narval/nestjs-shared'
import { Action } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class GrantPermissionRequestDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.GRANT_PERMISSION
  })
  action: typeof Action.GRANT_PERMISSION

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nonce: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  resourceId: string

  @IsNotEmptyArrayString()
  @ApiProperty()
  permissions: string[]
}

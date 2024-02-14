import { Action, BaseActionDto, BaseActionRequestDto, UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'

class UpdateUserDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsIn(Object.values(UserRole))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(UserRole)
  })
  role: UserRole
}

class UpdateUserActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.UPDATE_USER
  })
  action: typeof Action.UPDATE_USER

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  user: UpdateUserDataDto
}

export class UpdateUserRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: UpdateUserActionDto
}

import { Action, BaseActionDto, BaseActionRequestDto, UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator'

class UpdateUserDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole
}

class UpdateUserActionDto extends BaseActionDto {
  @Matches(Action.UPDATE_USER)
  @ApiProperty({
    enum: [Action.UPDATE_USER],
    default: Action.UPDATE_USER
  })
  action: typeof Action.UPDATE_USER

  @IsDefined()
  @Type(() => UpdateUserDataDto)
  @ValidateNested()
  @ApiProperty()
  user: UpdateUserDataDto
}

export class UpdateUserRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => UpdateUserActionDto)
  @ValidateNested()
  @ApiProperty()
  request: UpdateUserActionDto
}

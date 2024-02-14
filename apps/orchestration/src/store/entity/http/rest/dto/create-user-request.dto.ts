import { Action, BaseActionDto, BaseActionRequestDto, UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateUserDataDto {
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

  @IsString()
  @IsOptional()
  @ValidateNested()
  @ApiProperty({
    type: () => AuthCredentialDto,
    required: false
  })
  credential?: AuthCredentialDto
}

class CreateUserActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_USER
  })
  action: typeof Action.CREATE_USER

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  user: CreateUserDataDto
}

export class CreateUserRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: CreateUserActionDto
}

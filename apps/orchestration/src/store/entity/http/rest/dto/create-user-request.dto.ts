import { Action, BaseActionDto, BaseActionRequestDto, UserRole } from '@narval/authz-shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateUserDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole

  @IsOptional()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiPropertyOptional()
  credential?: AuthCredentialDto
}

class CreateUserActionDto extends BaseActionDto {
  @Matches(Action.CREATE_USER)
  @ApiProperty({
    enum: [Action.CREATE_USER],
    default: Action.CREATE_USER
  })
  action: typeof Action.CREATE_USER

  @IsDefined()
  @Type(() => CreateUserDataDto)
  @ValidateNested()
  @ApiProperty()
  user: CreateUserDataDto
}

export class CreateUserRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateUserActionDto)
  @ValidateNested()
  @ApiProperty()
  request: CreateUserActionDto
}

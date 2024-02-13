import { Action, UserRole } from '@narval/authz-shared'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

class CreateUserDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  uid: string

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole

  @IsDefined()
  @ValidateNested()
  @Type(() => AuthCredentialDto)
  @ApiProperty({ type: AuthCredentialDto })
  credential?: AuthCredentialDto
}

class CreateUserActionDto extends BaseActionDto {
  @Matches(Action.CREATE_USER)
  @ApiProperty({ default: Action.CREATE_USER })
  action: typeof Action.CREATE_USER

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateUserDataDto)
  @ApiProperty({ type: CreateUserDataDto })
  user: CreateUserDataDto
}

@ApiExtraModels(CreateUserActionDto, AuthCredentialDto)
export class CreateUserRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateUserActionDto)
  @ApiProperty({ type: CreateUserActionDto })
  request: CreateUserActionDto
}

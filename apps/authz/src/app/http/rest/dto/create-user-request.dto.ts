import { Action, UserRole } from '@narval/authz-shared'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

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
  @ApiProperty()
  @ValidateNested()
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

@ApiExtraModels(CreateUserActionDto, AuthCredentialDto)
export class CreateUserRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: CreateUserActionDto
}

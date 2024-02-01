import { AuthCredentialDto } from '@app/authz/app/http/rest/dto/auth-credential.dto'
import { BaseActionDto } from '@app/authz/app/http/rest/dto/base-action.dto'
import { BaseAdminRequestPayloadDto } from '@app/authz/app/http/rest/dto/base-admin-request-payload.dto'
import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString, ValidateNested } from 'class-validator'

class CreateOrganizationDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  @ValidateNested()
  credential: AuthCredentialDto
}

class CreateOrganizationActionDto extends BaseActionDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Action,
    default: Action.CREATE_ORGANIZATION
  })
  action: Action.CREATE_ORGANIZATION

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  organization: CreateOrganizationDataDto
}

export class CreateOrganizationRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: CreateOrganizationActionDto
}

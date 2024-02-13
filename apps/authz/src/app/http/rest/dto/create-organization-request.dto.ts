import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

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
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_ORGANIZATION
  })
  action: typeof Action.CREATE_ORGANIZATION

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

import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

class CreateOrganizationDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  uid: string

  @IsDefined()
  @ValidateNested()
  @Type(() => AuthCredentialDto)
  @ApiProperty({ type: AuthCredentialDto })
  credential: AuthCredentialDto
}

class CreateOrganizationActionDto extends BaseActionDto {
  @Matches(Action.CREATE_ORGANIZATION)
  @ApiProperty({ default: Action.CREATE_ORGANIZATION })
  action: typeof Action.CREATE_ORGANIZATION

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOrganizationDataDto)
  @ApiProperty({ type: CreateOrganizationDataDto })
  organization: CreateOrganizationDataDto
}

export class CreateOrganizationRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOrganizationActionDto)
  @ApiProperty({ type: CreateOrganizationActionDto })
  request: CreateOrganizationActionDto
}

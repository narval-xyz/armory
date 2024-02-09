import { Action, AuthCredentialDto, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'

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

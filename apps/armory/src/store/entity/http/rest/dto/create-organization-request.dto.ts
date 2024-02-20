import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateOrganizationDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsDefined()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto
}

class CreateOrganizationActionDto extends BaseActionDto {
  @Matches(Action.CREATE_ORGANIZATION)
  @ApiProperty({
    enum: [Action.CREATE_ORGANIZATION],
    default: Action.CREATE_ORGANIZATION
  })
  action: typeof Action.CREATE_ORGANIZATION

  @IsDefined()
  @Type(() => CreateOrganizationDataDto)
  @ValidateNested()
  @ApiProperty()
  organization: CreateOrganizationDataDto
}

export class CreateOrganizationRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateOrganizationActionDto)
  @ValidateNested()
  @ApiProperty()
  request: CreateOrganizationActionDto
}

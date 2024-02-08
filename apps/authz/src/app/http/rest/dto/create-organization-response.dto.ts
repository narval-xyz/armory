import { AuthCredential } from '@narval/authz-shared'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { Organization, User } from '../../../../shared/types/entities.types'
import { AuthCredentialDto } from './auth-credential.dto'
import { UserDto } from './user-dto'

class OrganizationDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string
}

@ApiExtraModels(OrganizationDataDto, AuthCredentialDto)
export class CreateOrganizationResponseDto {
  constructor(organization: Organization, rootCredential: AuthCredential, rootUser: User) {
    this.organization = organization
    this.rootCredential = rootCredential
    this.rootUser = rootUser
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  organization: OrganizationDataDto
  rootCredential: AuthCredentialDto
  rootUser: UserDto
}

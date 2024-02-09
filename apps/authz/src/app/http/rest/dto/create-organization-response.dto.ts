import { AuthCredential, AuthCredentialDto, UserDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { Organization, User } from '../../../../shared/types/entities.types'

class OrganizationDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string
}

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

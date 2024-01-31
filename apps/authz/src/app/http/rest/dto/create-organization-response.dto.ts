import { AuthCredentialDto } from '@app/authz/app/http/rest/dto/auth-credential.dto'
import { UserDto } from '@app/authz/app/http/rest/dto/user-dto'
import { Organization, User } from '@app/authz/shared/types/entities.types'
import { AuthCredential } from '@narval/authz-shared'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, ValidateNested } from 'class-validator'

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

import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { UserDto } from './user-dto'

class OrganizationDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string
}

export class CreateOrganizationResponseDto {
  @IsDefined()
  @Type(() => OrganizationDataDto)
  @ValidateNested()
  @ApiProperty({
    type: OrganizationDataDto
  })
  organization: OrganizationDataDto

  @IsDefined()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiProperty({
    type: AuthCredentialDto
  })
  rootCredential: AuthCredentialDto

  @IsDefined()
  @Type(() => UserDto)
  @ValidateNested()
  @ApiProperty({
    type: UserDto
  })
  rootUser: UserDto

  constructor(partial: Partial<CreateOrganizationResponseDto>) {
    Object.assign(this, partial)
  }
}

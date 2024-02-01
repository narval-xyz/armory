import { AuthCredentialDto } from '@app/authz/app/http/rest/dto/auth-credential.dto'
import { UserDto } from '@app/authz/app/http/rest/dto/user-dto'
import { User } from '@app/authz/shared/types/entities.types'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, ValidateNested } from 'class-validator'

class OrganizationDataDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string
}

@ApiExtraModels(OrganizationDataDto, AuthCredentialDto)
export class CreateUserResponseDto {
  constructor(user: User) {
    this.user = new UserDto(user)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  user: UserDto
}

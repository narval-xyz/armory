import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { User } from '../../../../shared/types/entities.types'
import { AuthCredentialDto } from './auth-credential.dto'
import { UserDto } from './user-dto'

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

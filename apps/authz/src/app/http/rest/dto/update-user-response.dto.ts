import { UserDto } from '@app/authz/app/http/rest/dto/user-dto'
import { User } from '@app/authz/shared/types/entities.types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class UpdateUserResponseDto {
  constructor(user: User) {
    this.user = new UserDto(user)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  user: UserDto
}

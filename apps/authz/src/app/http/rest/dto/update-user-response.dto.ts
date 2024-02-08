import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { User } from '../../../../shared/types/entities.types'
import { UserDto } from './user-dto'

export class UpdateUserResponseDto {
  constructor(user: User) {
    this.user = new UserDto(user)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  user: UserDto
}

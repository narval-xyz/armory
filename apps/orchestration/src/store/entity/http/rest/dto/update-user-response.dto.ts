import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { UserDto } from './user-dto'

export class UpdateUserResponseDto {
  @IsDefined()
  @Type(() => UserDto)
  @ValidateNested()
  @ApiProperty({
    type: UserDto
  })
  user: UserDto

  constructor(partial: Partial<UpdateUserResponseDto>) {
    Object.assign(this, partial)
  }
}

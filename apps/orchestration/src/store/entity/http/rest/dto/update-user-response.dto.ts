import { UserDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'

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

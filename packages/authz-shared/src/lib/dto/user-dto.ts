import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'
import { UserRole } from '../type/action.type'

export class UserDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsIn(Object.values(UserRole))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(UserRole)
  })
  role: UserRole

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial)
  }
}

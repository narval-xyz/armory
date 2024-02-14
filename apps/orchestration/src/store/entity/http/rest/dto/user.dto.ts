import { UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial)
  }
}

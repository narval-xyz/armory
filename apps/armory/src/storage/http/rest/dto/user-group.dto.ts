import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserGroupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  constructor(partial: Partial<UserGroupDto>) {
    Object.assign(this, partial)
  }
}

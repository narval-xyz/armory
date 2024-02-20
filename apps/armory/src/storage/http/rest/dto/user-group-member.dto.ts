import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  groupId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string

  constructor(partial: Partial<UserGroupMemberDto>) {
    Object.assign(this, partial)
  }
}

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserGroupMembershipDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  groupId: string

  constructor(partial: Partial<UserGroupMembershipDto>) {
    Object.assign(this, partial)
  }
}

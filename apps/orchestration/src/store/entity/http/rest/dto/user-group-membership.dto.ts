import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class UserGroupMembershipDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  userId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  groupId: string

  constructor(partial: Partial<UserGroupMembershipDto>) {
    Object.assign(this, partial)
  }
}

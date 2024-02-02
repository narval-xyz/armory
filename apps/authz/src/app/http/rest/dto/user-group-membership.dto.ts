import { UserGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class UserGroupMembershipDto {
  constructor(data: UserGroupMembership) {
    this.userId = data.userId
    this.groupId = data.groupId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  userId: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  groupId: string
}

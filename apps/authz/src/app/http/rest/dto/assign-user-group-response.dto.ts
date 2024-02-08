import { UserGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { UserGroupMembershipDto } from './user-group-membership.dto'

export class AssignUserGroupResponseDto {
  constructor(userGroup: UserGroupMembership) {
    this.data = new UserGroupMembershipDto(userGroup)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserGroupMembershipDto
}

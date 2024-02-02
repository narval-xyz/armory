import { UserGroupMembershipDto } from '@app/authz/app/http/rest/dto/user-group-membership.dto'
import { UserGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class AssignUserGroupResponseDto {
  constructor(userGroup: UserGroupMembership) {
    this.data = new UserGroupMembershipDto(userGroup)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserGroupMembershipDto
}

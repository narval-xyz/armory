import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { UserGroupMembershipDto } from './user-group-membership.dto'

class AssignUserGroupActionDto extends BaseActionDto {
  @Matches(Action.ASSIGN_USER_GROUP)
  @ApiProperty({
    enum: [Action.ASSIGN_USER_GROUP],
    default: Action.ASSIGN_USER_GROUP
  })
  action: typeof Action.ASSIGN_USER_GROUP

  @IsDefined()
  @Type(() => UserGroupMembershipDto)
  @ValidateNested()
  @ApiProperty()
  data: UserGroupMembershipDto
}

export class AssignUserGroupRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => AssignUserGroupActionDto)
  @ValidateNested()
  @ApiProperty()
  request: AssignUserGroupActionDto
}

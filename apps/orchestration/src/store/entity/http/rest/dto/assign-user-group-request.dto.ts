import { Action, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'
import { UserGroupMembershipDto } from './user-group-membership.dto'

class AssignUserGroupActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_USER_GROUP
  })
  action: typeof Action.ASSIGN_USER_GROUP

  @IsDefined()
  @Type(() => UserGroupMembershipDto)
  @ValidateNested()
  @ApiProperty({
    type: UserGroupMembershipDto
  })
  data: UserGroupMembershipDto
}

export class AssignUserGroupRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => AssignUserGroupActionDto)
  @ValidateNested()
  @ApiProperty({
    type: AssignUserGroupActionDto
  })
  request: AssignUserGroupActionDto
}

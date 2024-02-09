import { Action, BaseActionDto, BaseAdminRequestPayloadDto, UserGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'

class AssignUserGroupActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_USER_GROUP
  })
  action: typeof Action.ASSIGN_USER_GROUP

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserGroupMembership
}

export class AssignUserGroupRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: AssignUserGroupActionDto
}

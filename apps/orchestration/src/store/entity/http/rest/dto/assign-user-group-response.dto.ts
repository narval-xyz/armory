import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { UserGroupMembershipDto } from './user-group-membership.dto'

export class AssignUserGroupResponseDto {
  @IsDefined()
  @Type(() => UserGroupMembershipDto)
  @ValidateNested()
  @ApiProperty()
  data: UserGroupMembershipDto

  constructor(partial: Partial<AssignUserGroupResponseDto>) {
    Object.assign(this, partial)
  }
}

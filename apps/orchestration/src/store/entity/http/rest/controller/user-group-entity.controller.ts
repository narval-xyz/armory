import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserGroupEntityService } from '../../../core/service/user-group-entity.service'
import { AssignUserGroupRequestDto } from '../dto/assign-user-group-request.dto'
import { AssignUserGroupResponseDto } from '../dto/assign-user-group-response.dto'

@Controller('/store/user-groups')
@ApiTags('Entity Store')
export class UserGroupEntityController {
  constructor(private userGroupEntityService: UserGroupEntityService) {}

  @Post()
  @ApiOperation({
    summary: "Assigns a user to a group. If the group doesn't exist, creates it first."
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AssignUserGroupResponseDto
  })
  async assign(@OrgId() orgId: string, @Body() body: AssignUserGroupRequestDto): Promise<AssignUserGroupResponseDto> {
    const { userId, groupId } = body.request.data

    await this.userGroupEntityService.assign(orgId, userId, groupId)

    return new AssignUserGroupResponseDto({
      data: { userId, groupId }
    })
  }
}

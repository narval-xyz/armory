import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../orchestration.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserGroupService } from '../../../core/service/user-group.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { AssignUserGroupRequestDto } from '../dto/assign-user-group-request.dto'
import { AssignUserGroupResponseDto } from '../dto/assign-user-group-response.dto'

@Controller(`${API_PREFIX}/user-groups`)
@ApiTags(API_TAG)
export class UserGroupController {
  constructor(private userGroupService: UserGroupService) {}

  @Post()
  @ApiOperation({
    summary: "Assigns a user to a group. If the group doesn't exist, creates it first"
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AssignUserGroupResponseDto
  })
  async assign(@OrgId() orgId: string, @Body() body: AssignUserGroupRequestDto): Promise<AssignUserGroupResponseDto> {
    const { userId, groupId } = body.request.data

    await this.userGroupService.assign(orgId, body)

    return new AssignUserGroupResponseDto({
      data: { userId, groupId }
    })
  }
}

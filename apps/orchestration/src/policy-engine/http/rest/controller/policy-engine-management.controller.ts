import { REQUEST_HEADER_ORG_ID } from '@app/orchestration/src/orchestration.constant'
import { CreateUserRequestDto, CreateUserResponseDto } from '@narval/authz-shared'
import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../../shared/decorator/org-id.decorator'
import { ClusterService } from '../../../core/service/cluster.service'

@Controller('/policy-engine')
@ApiTags('Policy Engine Management')
export class PolicyEngineManagementController {
  constructor(private clusterService: ClusterService) {}

  @Post('/users')
  @ApiOperation({
    summary: 'Creates a new user entity on every policy engine node'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    description: 'The created user',
    status: HttpStatus.CREATED,
    type: CreateUserResponseDto
  })
  createUser(@OrgId() orgId: string, @Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.clusterService.createUser({
      orgId,
      data: body
    })
  }
}

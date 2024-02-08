import { CreateUserRequestDto, CreateUserResponseDto } from '@narval/authz-shared'
import { Body, Controller, Post } from '@nestjs/common'
import { OrgId } from '../../../../shared/decorator/org-id.decorator'
import { ClusterService } from '../../../core/service/cluster.service'

@Controller('/policy-engine')
export class PolicyEngineManagementController {
  constructor(private clusterService: ClusterService) {}

  @Post('/users')
  createUser(@OrgId() orgId: string, @Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.clusterService.createUser({
      orgId,
      data: body
    })
  }
}

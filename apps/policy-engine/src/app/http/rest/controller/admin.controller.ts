import { Body, Controller, Post } from '@nestjs/common'
import { SetPolicyRulesRequest } from '../../../../shared/types/policy.type'
import { AdminService } from '../../../core/admin.service'
import { SetPolicyRulesRequestDto } from '../dto/policy-rules/set-policy-rules-request.dto'
import { SetPolicyRulesResponseDto } from '../dto/policy-rules/set-policy-rules-response.dto'

@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/policies')
  async setPolicyRules(@Body() body: SetPolicyRulesRequestDto) {
    const payload: SetPolicyRulesRequest = body

    const policies = await this.adminService.setPolicyRules(payload)

    const response = new SetPolicyRulesResponseDto(policies)
    return response
  }
}

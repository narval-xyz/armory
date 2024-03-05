import { Injectable } from '@nestjs/common'
import { Policy, SetPolicyRulesRequest } from '../../../shared/types/policy.type'
import { OpaService } from '../../opa/opa.service'

@Injectable()
export class AdminService {
  constructor(private opaService: OpaService) {}

  async setPolicyRules(payload: SetPolicyRulesRequest): Promise<{ fileId: string; policies: Policy[] }> {
    const { fileId, policies } = this.opaService.generateRegoPolicies(payload.request.data)

    return { fileId, policies }
  }
}

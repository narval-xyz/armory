import { Injectable } from '@nestjs/common'
import { Policy, SetPolicyRulesRequest } from '../../shared/types/policy.type'
import { OpaService } from '../opa/opa.service'
import { AdminRepository } from '../persistence/repository/admin.repository'

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository, private opaService: OpaService) {}

  async setPolicyRules(payload: SetPolicyRulesRequest): Promise<{ policies: Policy[]; fileId: string }> {
    const fileId = this.opaService.generateRegoFile(payload.request.data)

    return { policies: payload.request.data, fileId }
  }
}

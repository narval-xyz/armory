import { JwtString } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { AuthorizationRequestService } from '../core/service/authorization-request.service'
import { AuthorizationRequest, CreateAuthorizationRequest } from '../core/type/domain.type'

@Injectable()
export class AuthorizationRequestGateway {
  constructor(private authorizationRequestService: AuthorizationRequestService) {}

  async evaluate(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    return this.authorizationRequestService.create(input)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    return this.authorizationRequestService.findById(id)
  }

  async approve(id: string, approval: JwtString): Promise<AuthorizationRequest> {
    return this.authorizationRequestService.approve(id, approval)
  }
}

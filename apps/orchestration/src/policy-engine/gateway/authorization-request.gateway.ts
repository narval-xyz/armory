import { Injectable } from '@nestjs/common'
import { SetOptional } from 'type-fest'
import { AuthorizationRequestService } from '../core/service/authorization-request.service'
import { Approval, AuthorizationRequest, CreateAuthorizationRequest } from '../core/type/domain.type'

@Injectable()
export class AuthorizationRequestGateway {
  constructor(private authorizationRequestService: AuthorizationRequestService) {}

  async evaluate(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    return this.authorizationRequestService.create(input)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    return this.authorizationRequestService.findById(id)
  }

  async approve(id: string, approval: SetOptional<Approval, 'id' | 'createdAt'>): Promise<AuthorizationRequest> {
    return this.authorizationRequestService.approve(id, approval)
  }
}

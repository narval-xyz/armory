import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthorizationRequestService {
  constructor(
    private authzRequestRepository: AuthorizationRequestRepository,
    private authzRequestProcessingProducer: AuthorizationRequestProcessingProducer
  ) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const authzRequest = await this.authzRequestRepository.create(input)

    await this.authzRequestProcessingProducer.add(authzRequest)

    return authzRequest
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    return this.authzRequestRepository.findById(id)
  }

  async process(id: string) {
    await this.authzRequestRepository.findById(id)

    await this.authzRequestRepository.changeStatus(id, AuthorizationRequestStatus.PROCESSING)

    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 3000)
    })
  }

  async complete(id: string) {
    await this.authzRequestRepository.changeStatus(id, AuthorizationRequestStatus.APPROVING)
  }
}

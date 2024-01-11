import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  MessageRequest,
  TransactionRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Injectable } from '@nestjs/common'
import { AuthorizationRequest as AuthorizationRequestModel } from '@prisma/client/orchestration'

const toDomainType = (model: AuthorizationRequestModel): AuthorizationRequest => {
  const shared = {
    id: model.id,
    orgId: model.orgId,
    initiatorId: model.initiatorId,
    status: model.status,
    hash: model.hash,
    idempotencyKey: model.idempotencyKey,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  }

  if (model.action === Action.SIGN_MESSAGE) {
    return {
      ...shared,
      action: model.action,
      request: {
        // IMPORTANT: Get rid of this force cast.
        message: (model.request as MessageRequest).message
      }
    }
  }

  // IMPORTANT: Get rid of this force cast.
  const request = model.request as TransactionRequest

  return {
    ...shared,
    action: model.action,
    request
  }
}

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create({
    id,
    action,
    request,
    orgId,
    initiatorId,
    hash,
    status,
    idempotencyKey,
    createdAt,
    updatedAt
  }: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const model = await this.prismaService.authorizationRequest.create({
      data: {
        status: status || AuthorizationRequestStatus.CREATED,
        id,
        orgId,
        initiatorId,
        action,
        request,
        hash,
        idempotencyKey,
        createdAt,
        updatedAt
      }
    })

    return toDomainType(model)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const model = await this.prismaService.authorizationRequest.findUnique({
      where: { id }
    })

    if (model) {
      return toDomainType(model)
    }

    return null
  }

  async findByStatus(
    statusOrStatuses: AuthorizationRequestStatus | AuthorizationRequestStatus[]
  ): Promise<AuthorizationRequest[]> {
    const models = await this.prismaService.authorizationRequest.findMany({
      where: {
        status: Array.isArray(statusOrStatuses) ? { in: statusOrStatuses } : statusOrStatuses
      }
    })

    return models.map(toDomainType)
  }

  async changeStatus(id: string, status: AuthorizationRequestStatus): Promise<AuthorizationRequest> {
    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: { status }
    })

    return toDomainType(model)
  }
}

import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { decodeAuthorizationRequest } from '@app/orchestration/policy-engine/persistence/decode/authorization-request.decode'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Injectable } from '@nestjs/common'
import { EvaluationLog } from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'

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
    updatedAt,
    evaluations
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
        updatedAt,
        evaluationLog: {
          create: evaluations.map((evaluation) => ({
            ...evaluation,
            orgId
          }))
        }
      },
      include: {
        evaluationLog: true
      }
    })

    return decodeAuthorizationRequest(model)
  }

  async update(input: Partial<AuthorizationRequest> & Pick<AuthorizationRequest, 'id'>): Promise<AuthorizationRequest> {
    const evaluations: EvaluationLog[] =
      input.orgId && input.evaluations?.length
        ? input.evaluations?.map((evaluation) => ({
            ...evaluation,
            signature: evaluation.signature,
            requestId: input.id,
            orgId: input.orgId as string
          }))
        : []

    const model = await this.prismaService.authorizationRequest.update({
      where: {
        id: input.id
      },
      data: {
        ...omit('evaluations', input),
        evaluationLog: {
          createMany: {
            data: evaluations
          }
        }
      }
    })

    return decodeAuthorizationRequest(model)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const model = await this.prismaService.authorizationRequest.findUnique({
      where: { id },
      include: {
        evaluationLog: true
      }
    })

    if (model) {
      return decodeAuthorizationRequest(model)
    }

    return null
  }

  async findByStatus(
    statusOrStatuses: AuthorizationRequestStatus | AuthorizationRequestStatus[]
  ): Promise<AuthorizationRequest[]> {
    const models = await this.prismaService.authorizationRequest.findMany({
      where: {
        status: Array.isArray(statusOrStatuses) ? { in: statusOrStatuses } : statusOrStatuses
      },
      include: {
        evaluationLog: true
      }
    })

    // TODO (@wcalderipe, 16/01/24): The function `decodeAuthorizationRequest`
    // throws an error on invalid requests. Consequently, it shorts circuit the
    // decoding of all models.
    return models.map(decodeAuthorizationRequest)
  }
}

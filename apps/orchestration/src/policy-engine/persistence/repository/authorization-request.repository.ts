import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Evaluation
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { decodeAuthorizationRequest } from '@app/orchestration/policy-engine/persistence/decode/authorization-request.decode'
import {
  createAuthorizationRequestSchema,
  updateAuthorizationRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/authorization-request.schema'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Injectable } from '@nestjs/common'
import { EvaluationLog } from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'

const toEvaluationLogs = (
  requestId: string,
  orgId?: string,
  evaluations?: Omit<Evaluation, 'requestId'>[]
): EvaluationLog[] =>
  orgId && evaluations?.length
    ? evaluations.map((evaluation) => ({
        ...evaluation,
        orgId,
        requestId
      }))
    : []

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const { id, action, request, orgId, initiatorId, hash, status, idempotencyKey, createdAt, updatedAt, evaluations } =
      createAuthorizationRequestSchema.parse(input)
    const evaluationLogs = toEvaluationLogs(id, orgId, evaluations)

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
          createMany: {
            data: evaluationLogs.map(omit('requestId'))
          }
        }
      },
      include: {
        evaluationLog: true
      }
    })

    return decodeAuthorizationRequest(model)
  }

  /**
   * Updates only allowed attributes of an authorization request.
   *
   * This restriction is in place because altering the data of an authorization
   * request would mean tampering with the user's original request.
   *
   * @param input Partial version of {AuthorizationRequest} including the {id}.
   * @returns {AuthorizationRequest}
   */
  async update(
    input: Partial<Pick<AuthorizationRequest, 'orgId' | 'status' | 'evaluations'>> & Pick<AuthorizationRequest, 'id'>
  ): Promise<AuthorizationRequest> {
    const { id } = input
    const { orgId, status, evaluations } = updateAuthorizationRequestSchema.parse(input)
    const evaluationLogs = toEvaluationLogs(id, orgId, evaluations)

    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: {
        status,
        evaluationLog: {
          createMany: {
            data: evaluationLogs.map(omit('requestId'))
          }
        }
      },
      include: {
        evaluationLog: true
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

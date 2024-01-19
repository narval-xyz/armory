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
import { v4 as uuid } from 'uuid'

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const { id, action, request, orgId, hash, status, idempotencyKey, createdAt, updatedAt, evaluations, approvals } =
      createAuthorizationRequestSchema.parse(this.getDefaults(input))
    const evaluationLogs = this.toEvaluationLogs(orgId, evaluations)

    const model = await this.prismaService.authorizationRequest.create({
      data: {
        id,
        status,
        orgId,
        action,
        request,
        hash,
        idempotencyKey,
        createdAt,
        updatedAt,
        approvals: {
          createMany: {
            data: approvals
          }
        },
        evaluationLog: {
          createMany: {
            data: evaluationLogs
          }
        }
      },
      include: {
        approvals: true,
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
    input: Partial<Pick<AuthorizationRequest, 'orgId' | 'status' | 'evaluations' | 'approvals'>> &
      Pick<AuthorizationRequest, 'id'>
  ): Promise<AuthorizationRequest> {
    const { id } = input
    const { orgId, status, evaluations, approvals } = updateAuthorizationRequestSchema.parse(input)
    const evaluationLogs = this.toEvaluationLogs(orgId, evaluations)

    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: {
        status,
        approvals: {
          createMany: {
            data: approvals?.length ? approvals : []
          }
        },
        evaluationLog: {
          createMany: {
            data: evaluationLogs
          }
        }
      },
      include: {
        approvals: true,
        evaluationLog: true
      }
    })

    return decodeAuthorizationRequest(model)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const model = await this.prismaService.authorizationRequest.findUnique({
      where: { id },
      include: {
        approvals: true,
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
        approvals: true,
        evaluationLog: true
      }
    })

    // TODO (@wcalderipe, 16/01/24): The function `decodeAuthorizationRequest`
    // throws an error on invalid requests. Consequently, it shorts circuit the
    // decoding of all models.
    return models.map(decodeAuthorizationRequest)
  }

  private getDefaults(input: CreateAuthorizationRequest): AuthorizationRequest {
    const now = new Date()

    return {
      ...input,
      id: input.id || uuid(),
      status: input.status || AuthorizationRequestStatus.CREATED,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      approvals: input.approvals.map((approval) => ({
        ...approval,
        id: approval.id || uuid(),
        createdAt: approval.createdAt || now
      }))
    }
  }

  private toEvaluationLogs(orgId?: string, evaluations?: Evaluation[]): Omit<EvaluationLog, 'requestId'>[] {
    return orgId && evaluations?.length
      ? evaluations.map((evaluation) => ({
          ...evaluation,
          orgId
        }))
      : []
  }
}

import { Injectable } from '@nestjs/common'
import { EvaluationLog } from '@prisma/client/armory'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Evaluation
} from '../../core/type/domain.type'
import { decodeAuthorizationRequest } from '../decode/authorization-request.decode'
import { createRequestSchema } from '../schema/request.schema'

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const { id, clientId, status, idempotencyKey, createdAt, updatedAt, evaluations, approvals, authentication } =
      this.getDefaults(input)
    const request = createRequestSchema.parse(input.request)
    const evaluationLogs = this.toEvaluationLogs(clientId, evaluations)

    const approvalsData = approvals.map((approval) => ({
      sig: approval
    }))

    const model = await this.prismaService.authorizationRequest.create({
      data: {
        id,
        status,
        clientId,
        request,
        idempotencyKey,
        createdAt,
        updatedAt,
        action: request.action,
        authnSig: authentication,
        approvals: approvals
          ? {
              createMany: {
                data: approvalsData
              }
            }
          : undefined,
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
    input: Partial<Pick<AuthorizationRequest, 'clientId' | 'status' | 'evaluations' | 'approvals'>> &
      Pick<AuthorizationRequest, 'id'>
  ): Promise<AuthorizationRequest> {
    const { id, clientId, status, evaluations, approvals } = input
    const evaluationLogs = this.toEvaluationLogs(clientId, evaluations)

    // TODO (@wcalderipe, 19/01/24): Cover the skipDuplicate with tests.
    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: {
        status,
        approvals: {
          createMany: {
            data: approvals?.length ? approvals.map((sig) => ({ sig })) : [],
            skipDuplicates: true
          }
        },
        evaluationLog: {
          createMany: {
            data: evaluationLogs,
            skipDuplicates: true
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
      approvals: input.approvals
    }
  }

  private toEvaluationLogs(clientId?: string, evaluations?: Evaluation[]): Omit<EvaluationLog, 'requestId'>[] {
    return clientId && evaluations?.length
      ? evaluations.map((evaluation) => ({
          ...evaluation,
          clientId
        }))
      : []
  }
}

import {
  AuthorizationRequest,
  AuthorizationRequestError,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Evaluation
} from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { decodeAuthorizationRequest } from '../decode/authorization-request.decode'
import { createRequestSchema } from '../schema/request.schema'

@Injectable()
export class AuthorizationRequestRepository {
  constructor(private prismaService: PrismaService) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    const { id, clientId, status, idempotencyKey, createdAt, updatedAt, metadata, authentication } =
      this.getDefaults(input)
    const request = createRequestSchema.parse(input.request)
    const approvals = (input.approvals || []).map((sig) => ({ sig }))
    const errors = this.toErrors(clientId, input.errors)
    const evaluationLogs = this.toEvaluationLogs(clientId, input.evaluations)

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
        metadata,
        approvals: {
          createMany: {
            data: approvals
          }
        },
        errors: {
          createMany: {
            data: errors
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
        errors: true,
        evaluationLog: true
      }
    })

    return decodeAuthorizationRequest(model)
  }

  private toEvaluationLogs(clientId?: string, evaluations?: Evaluation[]) {
    if (clientId && evaluations?.length) {
      return evaluations.map((evaluation) => ({
        ...evaluation,
        clientId
      }))
    }

    return []
  }

  private toErrors(clientId?: string, errors?: AuthorizationRequestError[]) {
    if (clientId && errors?.length) {
      return errors.map((error) => ({
        id: error.id,
        clientId,
        name: error.name,
        message: error.message
      }))
    }

    return []
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
    input: Partial<Pick<AuthorizationRequest, 'clientId' | 'status' | 'evaluations' | 'approvals' | 'errors'>> &
      Pick<AuthorizationRequest, 'id'>
  ): Promise<AuthorizationRequest> {
    const { id, clientId, status } = input
    const approvals = (input.approvals || []).map((sig) => ({ sig }))
    const errors = this.toErrors(clientId, input.errors)
    const evaluationLogs = this.toEvaluationLogs(clientId, input.evaluations)

    // TODO (@wcalderipe, 19/01/24): Cover the skipDuplicate with tests.
    const model = await this.prismaService.authorizationRequest.update({
      where: { id },
      data: {
        status,
        approvals: {
          createMany: {
            data: approvals,
            skipDuplicates: true
          }
        },
        evaluationLog: {
          createMany: {
            data: evaluationLogs,
            skipDuplicates: true
          }
        },
        errors: {
          createMany: {
            data: errors,
            skipDuplicates: true
          }
        }
      },
      include: {
        approvals: true,
        evaluationLog: true,
        errors: true
      }
    })

    return decodeAuthorizationRequest(model)
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const model = await this.prismaService.authorizationRequest.findUnique({
      where: { id },
      include: {
        approvals: true,
        evaluationLog: true,
        errors: true
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
        evaluationLog: true,
        errors: true
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
      evaluations: input.evaluations || [],
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      approvals: input.approvals || []
    }
  }
}

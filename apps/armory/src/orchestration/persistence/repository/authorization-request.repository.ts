import {
  AuthorizationRequest,
  AuthorizationRequestError,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Evaluation
} from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/armory'
import { v4 as uuid } from 'uuid'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { decodeAuthorizationRequest, decodeEvaluationLog } from '../decode/authorization-request.decode'
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

    await this.prismaService.authorizationRequest.create({
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
        }
      },
      include: {
        approvals: true,
        errors: true
      }
    })

    await this.createEvaluationLogs({
      requestId: id,
      clientId,
      evaluations: input.evaluations
    })

    const authRequest = await this.findById(id)
    if (!authRequest) {
      throw new ApplicationException({
        message: 'Authorization request not found',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }
    return authRequest
  }

  private async createEvaluationLogs({
    requestId,
    clientId,
    evaluations
  }: {
    requestId: string
    clientId?: string
    evaluations?: Evaluation[]
  }) {
    const evaluationLogs = this.toEvaluationLogs({ requestId, clientId, evaluations })
    const approvalRequirements = this.toApprovalRequirements(evaluations)

    await this.prismaService.evaluationLog.createMany({
      data: evaluationLogs
    })

    await this.prismaService.approvalRequirement.createMany({
      data: approvalRequirements
    })

    return this.getEvaluationLogs(requestId)
  }

  private async getEvaluationLogs(requestId: string) {
    const evaluationLogs = await this.prismaService.evaluationLog.findMany({
      where: { requestId },
      include: {
        approvals: true
      }
    })

    return evaluationLogs.map(decodeEvaluationLog)
  }

  private toEvaluationLogs({
    requestId,
    clientId,
    evaluations
  }: {
    requestId: string
    clientId?: string
    evaluations?: Evaluation[]
  }): Prisma.EvaluationLogCreateManyInput[] {
    if (clientId && evaluations?.length) {
      return evaluations.map((e) => {
        const { transactionRequestIntent, approvalRequirements, ...evaluation } = e

        return {
          ...evaluation,
          requestId,
          clientId,
          transactionRequestIntent: transactionRequestIntent as Prisma.InputJsonObject | undefined
        }
      })
    }

    return []
  }

  private toApprovalRequirements(evaluations?: Evaluation[]): Prisma.ApprovalRequirementCreateManyInput[] {
    return (
      evaluations?.flatMap((e) => {
        const { id: evaluationId, approvalRequirements } = e

        const satisfied =
          approvalRequirements?.satisfied?.map((approvalRequirement) => ({
            ...approvalRequirement,
            id: hash(approvalRequirement)
          })) || []

        return (
          approvalRequirements?.required?.map((requirement) => ({
            isSatisfied: satisfied.find((s) => s.id === hash(requirement)) ? true : false,
            evaluationId,
            ...requirement
          })) || []
        )
      }) || []
    )
  }

  private toErrors(
    clientId?: string,
    errors?: AuthorizationRequestError[]
  ): Prisma.AuthorizationRequestErrorCreateManyRequestInput[] {
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

    // TODO (@wcalderipe, 19/01/24): Cover the skipDuplicate with tests.
    await this.prismaService.authorizationRequest.update({
      where: { id },
      data: {
        status,
        approvals: {
          createMany: {
            data: approvals,
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
        errors: true
      }
    })

    await this.createEvaluationLogs({
      requestId: id,
      clientId,
      evaluations: input.evaluations
    })

    const authRequest = await this.findById(id)
    if (!authRequest) {
      throw new ApplicationException({
        message: 'Authorization request not found',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }
    return authRequest
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const authorizationRequestModel = await this.prismaService.authorizationRequest.findUnique({
      where: { id },
      include: {
        approvals: true,
        errors: true,
        evaluationLog: {
          include: {
            approvals: true
          }
        }
      }
    })

    if (authorizationRequestModel) {
      const authRequest = decodeAuthorizationRequest(authorizationRequestModel)
      return authRequest
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
        evaluationLog: {
          include: {
            approvals: true
          }
        },
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

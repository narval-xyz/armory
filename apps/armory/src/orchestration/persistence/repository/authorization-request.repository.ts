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

    const evaluationLogs = this.toEvaluationLogs({ requestId: id, clientId, evaluations: input.evaluations })
    const approvalRequirements = this.toApprovalRequirements(input.evaluations)

    await this.prismaService.$transaction(async (prisma) => {
      await prisma.authorizationRequest.create({
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

      await prisma.evaluationLog.createMany({
        data: evaluationLogs
      })

      await prisma.approvalRequirement.createMany({
        data: approvalRequirements
      })
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
        name: error.name || 'Unknown error',
        message: error.message || ''
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
    const approvals: Prisma.AuthorizationRequestApprovalCreateManyRequestInput[] = (input.approvals || []).map(
      (sig) => ({ sig })
    )
    const errors = this.toErrors(clientId, input.errors)

    const updateData: Prisma.AuthorizationRequestUpdateInput = {
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
    }
    const evaluationLogs = this.toEvaluationLogs({ requestId: id, clientId, evaluations: input.evaluations })
    const approvalRequirements = this.toApprovalRequirements(input.evaluations)

    // Do the update in a tx to avoid partial updates.
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.authorizationRequest.update({
        where: { id },
        data: updateData
      })

      await prisma.evaluationLog.createMany({
        data: evaluationLogs
      })

      await prisma.approvalRequirement.createMany({
        data: approvalRequirements
      })
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

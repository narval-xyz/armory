import {
  ApprovalRequirement,
  ApprovalRequirementsObject,
  AuthorizationRequest,
  AuthorizationRequestError,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Evaluation
} from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ApprovalRequirement as ApprovalRequirementModel } from '@prisma/client/armory'
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

    const authorizationRequestModel = await this.prismaService.authorizationRequest.create({
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

    const authRequest = decodeAuthorizationRequest(authorizationRequestModel)
    const evaluations = await this.createEvaluationLogs({
      requestId: id,
      clientId,
      evaluations: input.evaluations
    })

    return { ...authRequest, evaluations }
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
    const evaluationLogs = this.toEvaluationLogs(requestId, clientId, evaluations)

    const evaluationLogsModel = await Promise.all(
      evaluationLogs.map(({ approvalRequirements, ...evaluation }) =>
        this.prismaService.evaluationLog.create({
          data: {
            ...evaluation,
            approvals: {
              createMany: {
                data: approvalRequirements
              }
            }
          },
          include: {
            approvals: true
          }
        })
      )
    )

    return evaluationLogsModel.map((e) => ({
      ...e,
      approvalRequirements: this.toApprovalRequirementObject(e.approvals)
    }))
  }

  private toApprovalRequirementModel(requirements?: ApprovalRequirementsObject) {
    const satisfied =
      requirements?.satisfied?.map((approvalRequirement) => ({
        id: hash(approvalRequirement),
        ...approvalRequirement
      })) || []

    return (
      requirements?.required?.map((requirement) => ({
        isSatisfied: satisfied.find((s) => s.id === hash(requirement)) ? true : false,
        ...requirement
      })) || []
    )
  }

  private toApprovalRequirementObject(requirements: ApprovalRequirementModel[]): ApprovalRequirementsObject {
    const result: Required<ApprovalRequirementsObject> = {
      required: [],
      satisfied: [],
      missing: []
    }

    requirements.forEach((r) => {
      const requirement = ApprovalRequirement.parse(r)

      if (r.isSatisfied) {
        result.satisfied.push(requirement)
      } else {
        result.missing.push(requirement)
      }
      result.required.push(requirement)
    })

    return result
  }

  private toEvaluationLogs(requestId: string, clientId?: string, evaluations?: Evaluation[]) {
    if (clientId && evaluations?.length) {
      return evaluations?.map((e) => {
        const { transactionRequestIntent, approvalRequirements, ...evaluation } = e

        return {
          ...evaluation,
          requestId,
          clientId,
          approvalRequirements: this.toApprovalRequirementModel(approvalRequirements),
          transactionRequestIntent: transactionRequestIntent
            ? JSON.parse(JSON.stringify(transactionRequestIntent))
            : null
        }
      })
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

    // TODO (@wcalderipe, 19/01/24): Cover the skipDuplicate with tests.
    const authorizationRequestModel = await this.prismaService.authorizationRequest.update({
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

    const authRequest = decodeAuthorizationRequest(authorizationRequestModel)
    const evaluations = await this.createEvaluationLogs({
      requestId: id,
      clientId,
      evaluations: input.evaluations
    })

    return { ...authRequest, evaluations }
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const authorizationRequestModel = await this.prismaService.authorizationRequest.findUnique({
      where: { id },
      include: {
        approvals: true,
        evaluationLog: true,
        errors: true
      }
    })

    if (authorizationRequestModel) {
      const authRequest = decodeAuthorizationRequest(authorizationRequestModel)

      const evaluationLogsModel = await this.prismaService.evaluationLog.findMany({
        where: { requestId: id },
        include: {
          approvals: true
        }
      })

      const evaluations = evaluationLogsModel.map((e) => ({
        ...e,
        approvalRequirements: this.toApprovalRequirementObject(e.approvals)
      }))

      return { ...authRequest, evaluations }
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

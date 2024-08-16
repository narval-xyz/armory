import {
  Action,
  ApprovalRequirement,
  Approvals,
  AuthorizationRequest,
  AuthorizationRequestError,
  Evaluation
} from '@narval/policy-engine-shared'
import {
  ApprovalRequirement as ApprovalRequirementModel,
  AuthorizationRequestError as AuthorizationRequestErrorModel,
  Prisma
} from '@prisma/client/armory'
import { ZodIssueCode, ZodSchema, z } from 'zod'
import { ACTION_REQUEST } from '../../orchestration.constant'
import { DecodeAuthorizationRequestException } from '../../persistence/exception/decode-authorization-request.exception'
import { AuthorizationRequestModel, EvaluationLogWithApprovalsModel } from '../../persistence/type/model.type'

const actionSchema = z.nativeEnum(Action)

const buildError = ({ id, message, name }: AuthorizationRequestErrorModel): AuthorizationRequestError => ({
  id,
  message,
  name
})

const buildSharedAttributes = (model: AuthorizationRequestModel): Omit<AuthorizationRequest, 'action' | 'request'> => {
  return {
    id: model.id,
    clientId: model.clientId,
    status: model.status,
    idempotencyKey: model.idempotencyKey,
    authentication: model.authnSig,
    approvals: z.array(z.string()).parse(model.approvals.filter(({ error }) => !error).map((approval) => approval.sig)),
    evaluations: (model.evaluationLog || []).map(decodeEvaluationLog),
    metadata: model.metadata as Prisma.InputJsonObject,
    errors: (model.errors || []).map(buildError),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  }
}

/**
 * Decodes a given schema with proper error handling.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
const decode = ({ model, schema }: { model: AuthorizationRequestModel; schema: ZodSchema }): AuthorizationRequest => {
  try {
    const decode = schema.safeParse(model.request)

    if (decode.success) {
      return {
        ...buildSharedAttributes(model),
        request: decode.data
      }
    }
    throw new DecodeAuthorizationRequestException(decode.error.issues)
  } catch (error) {
    // The try/catch statement is implemented here specifically to prevent the
    // irony of "safeParse" throwing a TypeError due to bigint coercion on
    // null and undefined values.
    throw new DecodeAuthorizationRequestException([
      {
        code: ZodIssueCode.custom,
        message: `Unknown decode exception ${error.message}`,
        path: ['request']
      }
    ])
  }
}

/**
 * Decodes an authorization request based on its action, throws on errors.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
export const decodeAuthorizationRequest = (model: AuthorizationRequestModel): AuthorizationRequest => {
  const action = actionSchema.safeParse(model.action)

  if (action.success) {
    const config = ACTION_REQUEST.get(action.data)

    if (config) {
      return decode({
        model,
        schema: config.schema.read
      })
    }
  }

  throw new DecodeAuthorizationRequestException([
    {
      code: ZodIssueCode.invalid_literal,
      message: 'Authorization request decoder not found for action type',
      path: ['action'],
      expected: Object.keys(ACTION_REQUEST),
      received: model.action
    }
  ])
}

/**
 * Decodes the list of approval requirements into the Approval object type, throws on errors.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {Approvals}
 */
export const decodeApprovalRequirement = (requirements: ApprovalRequirementModel[]): Approvals => {
  const result: Required<Approvals> = requirements.reduce(
    (acc, r) => {
      const parsed = ApprovalRequirement.safeParse(r)
      if (!parsed.success) {
        throw new DecodeAuthorizationRequestException(parsed.error.issues)
      }
      const requirement = parsed.data

      if (r.isSatisfied) {
        acc.satisfied.push(requirement)
      } else {
        acc.missing.push(requirement)
      }

      acc.required.push(requirement)

      return acc
    },
    { required: [], satisfied: [], missing: [] } as Required<Approvals>
  )

  return result
}

export const decodeEvaluationLog = (evaluation: EvaluationLogWithApprovalsModel): Evaluation => ({
  id: evaluation.id,
  decision: evaluation.decision,
  signature: evaluation.signature,
  transactionRequestIntent: evaluation.transactionRequestIntent,
  createdAt: evaluation.createdAt,
  approvalRequirements: decodeApprovalRequirement(evaluation.approvals)
})

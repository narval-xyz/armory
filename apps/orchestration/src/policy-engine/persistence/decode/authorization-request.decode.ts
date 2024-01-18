import { AuthorizationRequest, Evaluation } from '@app/orchestration/policy-engine/core/type/domain.type'
import { DecodeAuthorizationRequestException } from '@app/orchestration/policy-engine/persistence/exception/decode-authorization-request.exception'
import { ACTION_REQUEST } from '@app/orchestration/policy-engine/policy-engine.constant'
import {
  AuthorizationRequestApproval,
  AuthorizationRequest as AuthorizationRequestModel,
  EvaluationLog
} from '@prisma/client/orchestration'
import { omit } from 'lodash/fp'
import { ZodIssueCode, ZodSchema } from 'zod'

type Model = AuthorizationRequestModel & { evaluationLog?: EvaluationLog[]; approvals: AuthorizationRequestApproval[] }

const buildEvaluation = ({ id, decision, signature, createdAt }: EvaluationLog): Evaluation => ({
  id,
  decision,
  signature,
  createdAt
})

const buildSharedAttributes = (model: Model) => ({
  id: model.id,
  orgId: model.orgId,
  status: model.status,
  hash: model.hash,
  idempotencyKey: model.idempotencyKey,
  approvals: (model.approvals || []).map(omit('requestId')),
  evaluations: (model.evaluationLog || []).map(buildEvaluation),
  createdAt: model.createdAt,
  updatedAt: model.updatedAt
})

/**
 * Decodes a given schema with proper error handling.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
const decode = ({ model, schema }: { model: Model; schema: ZodSchema }): AuthorizationRequest => {
  try {
    const decode = schema.safeParse(model.request)

    if (decode.success) {
      return {
        ...buildSharedAttributes(model),
        action: model.action,
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
export const decodeAuthorizationRequest = (model: Model): AuthorizationRequest => {
  const config = ACTION_REQUEST[model.action]

  if (config) {
    return decode({
      model,
      schema: config.schema.read
    })
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

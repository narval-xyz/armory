import { Action, AuthorizationRequest, Evaluation } from '@app/orchestration/policy-engine/core/type/domain.type'
import { DecodeAuthorizationRequestException } from '@app/orchestration/policy-engine/persistence/exception/decode-authorization-request.exception'
import { signMessageRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-message-request.schema'
import { signTransactionRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { AuthorizationRequest as AuthorizationRequestModel, EvaluationLog } from '@prisma/client/orchestration'
import { ZodIssueCode, ZodSchema } from 'zod'

type Model = AuthorizationRequestModel & { evaluationLog?: EvaluationLog[] }

type Decode = (model: Model) => AuthorizationRequest

const buildEvaluation = ({ id, decision, signature, createdAt }: EvaluationLog): Evaluation => ({
  id,
  decision,
  signature,
  createdAt
})

const buildSharedAttributes = (model: Model) => ({
  id: model.id,
  orgId: model.orgId,
  initiatorId: model.initiatorId,
  status: model.status,
  hash: model.hash,
  idempotencyKey: model.idempotencyKey,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
  evaluations: (model.evaluationLog || []).map(buildEvaluation)
})

/**
 * Decodes a given schema with proper error handling.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
const withErrorHandling = ({
  model,
  action,
  schema
}: {
  model: Model
  action: Action
  schema: ZodSchema
}): AuthorizationRequest => {
  if (model.action === action) {
    const decode = schema.safeParse(model.request)

    if (decode.success) {
      return {
        ...buildSharedAttributes(model),
        action: model.action,
        request: decode.data
      }
    }

    throw new DecodeAuthorizationRequestException(decode.error.issues)
  }

  throw new DecodeAuthorizationRequestException([
    {
      code: ZodIssueCode.custom,
      message: 'Invalid decode strategy action',
      path: ['action']
    }
  ])
}

const decodeSignMessage: Decode = (model: Model) =>
  withErrorHandling({
    model,
    action: Action.SIGN_MESSAGE,
    schema: signMessageRequestSchema
  })

const decodeSignTransaction: Decode = (model: Model) =>
  withErrorHandling({
    model,
    action: Action.SIGN_TRANSACTION,
    schema: signTransactionRequestSchema
  })

/**
 * Decodes an authorization request based on its action, throws on errors.
 *
 * @throws {DecodeAuthorizationRequestException}
 * @returns {AuthorizationRequest}
 */
export const decodeAuthorizationRequest = (model: Model): AuthorizationRequest => {
  const decoders = new Map<`${Action}`, Decode>([
    [Action.SIGN_MESSAGE, decodeSignMessage],
    [Action.SIGN_TRANSACTION, decodeSignTransaction]
  ])

  const decode = decoders.get(model.action)

  if (decode) {
    return decode(model)
  }

  throw new DecodeAuthorizationRequestException([
    {
      code: ZodIssueCode.invalid_literal,
      message: 'Authorization request decoder not found for action type',
      path: ['action'],
      expected: Array.from(decoders.keys()),
      received: model.action
    }
  ])
}

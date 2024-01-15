import { Action, AuthorizationRequest, Evaluation } from '@app/orchestration/policy-engine/core/type/domain.type'
import { signMessageRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-message-request.schema'
import { signTransactionRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { AuthorizationRequest as AuthorizationRequestModel, EvaluationLog } from '@prisma/client/orchestration'

type DecodeSuccess = {
  success: true
  authorizationRequest: AuthorizationRequest
}

type DecodeError = {
  success: false
  reason: string
}

type Model = AuthorizationRequestModel & { evaluationLog?: EvaluationLog[] }

interface DecodeAuthorizationRequestStrategy {
  decode(model: Model): DecodeError | DecodeSuccess
}

const buildEvaluation = ({ id, decision, signature, createdAt }: EvaluationLog): Evaluation => ({
  id,
  decision,
  signature,
  createdAt
})

const getSharedAttributes = (model: Model) => ({
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

class SignMessageDecodeStrategy implements DecodeAuthorizationRequestStrategy {
  decode(model: Model): DecodeSuccess | DecodeError {
    if (model.action === Action.SIGN_MESSAGE) {
      const decode = signMessageRequestSchema.safeParse(model.request)

      if (decode.success) {
        return {
          success: true,
          authorizationRequest: {
            ...getSharedAttributes(model),
            action: model.action,
            request: decode.data
          }
        }
      }

      return {
        success: false,
        reason: decode.error.errors.toString()
      }
    }

    return {
      success: false,
      reason: 'INVALID_DECODE_ACTION'
    }
  }
}

class SignTransactionDecodeStrategy implements DecodeAuthorizationRequestStrategy {
  decode(model: Model): DecodeSuccess | DecodeError {
    if (model.action === Action.SIGN_TRANSACTION) {
      const decode = signTransactionRequestSchema.safeParse(model.request)

      if (decode.success) {
        return {
          success: true,
          authorizationRequest: {
            ...getSharedAttributes(model),
            action: model.action,
            request: decode.data
          }
        }
      }

      return {
        success: false,
        reason: decode.error.errors.map((error) => `${error.message} at ${error.path}`).join(', ')
      }
    }

    return {
      success: false,
      reason: 'INVALID_DECODE_ACTION'
    }
  }
}

export const isDecodeSuccess = (decode: DecodeError | DecodeSuccess): decode is DecodeSuccess => decode.success

export const isDecodeError = (decode: DecodeError | DecodeSuccess): decode is DecodeError => decode.success === false

export const decodeAuthorizationRequest = (model: Model): DecodeError | DecodeSuccess => {
  const strategies = new Map<`${Action}`, DecodeAuthorizationRequestStrategy>([
    [Action.SIGN_MESSAGE, new SignMessageDecodeStrategy()],
    [Action.SIGN_TRANSACTION, new SignTransactionDecodeStrategy()]
  ])

  const strategy = strategies.get(model.action)

  if (strategy) {
    return strategy.decode(model)
  }

  return {
    success: false,
    reason: 'DECODE_STRATEGY_NOT_FOUND'
  }
}

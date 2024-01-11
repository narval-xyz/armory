import { Action, AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { signMessageRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-message-request.schema'
import { signTransactionRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { AuthorizationRequest as AuthorizationRequestModel } from '@prisma/client/orchestration'

type DecodeSuccess = {
  success: true
  authorizationRequest: AuthorizationRequest
}

type DecodeError = {
  success: false
  reason: string
}

interface DecodeAuthorizationRequestStrategy {
  decode(model: AuthorizationRequestModel): DecodeError | DecodeSuccess
}

const getSharedAttributes = (model: AuthorizationRequestModel) => ({
  id: model.id,
  orgId: model.orgId,
  initiatorId: model.initiatorId,
  status: model.status,
  hash: model.hash,
  idempotencyKey: model.idempotencyKey,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt
})

class SignMessageDecodeStrategy implements DecodeAuthorizationRequestStrategy {
  decode(model: AuthorizationRequestModel): DecodeSuccess | DecodeError {
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
  decode(model: AuthorizationRequestModel): DecodeSuccess | DecodeError {
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

export const decodeAuthorizationRequest = (model: AuthorizationRequestModel): DecodeError | DecodeSuccess => {
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

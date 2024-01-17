import { Action } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  createSignMessageRequestSchema,
  readSignMessageRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-message-request.schema'
import {
  createSignTransactionRequestSchema,
  readSignTransactionRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { ZodType } from 'zod'

type ActionRequestConfig = {
  action: Action
  schema: {
    read: ZodType
    create: ZodType
  }
}

export const ACTION_REQUEST: Record<Action, ActionRequestConfig> = {
  [Action.SIGN_MESSAGE]: {
    action: Action.SIGN_MESSAGE,
    schema: {
      read: readSignMessageRequestSchema,
      create: createSignMessageRequestSchema
    }
  },
  [Action.SIGN_TRANSACTION]: {
    action: Action.SIGN_TRANSACTION,
    schema: {
      read: readSignTransactionRequestSchema,
      create: createSignTransactionRequestSchema
    }
  }
}

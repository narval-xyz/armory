import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
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
  action: SupportedAction
  schema: {
    read: ZodType
    create: ZodType
  }
}

export const ACTION_REQUEST: Record<SupportedAction, ActionRequestConfig> = {
  [SupportedAction.SIGN_MESSAGE]: {
    action: SupportedAction.SIGN_MESSAGE,
    schema: {
      read: readSignMessageRequestSchema,
      create: createSignMessageRequestSchema
    }
  },
  [SupportedAction.SIGN_TRANSACTION]: {
    action: SupportedAction.SIGN_TRANSACTION,
    schema: {
      read: readSignTransactionRequestSchema,
      create: createSignTransactionRequestSchema
    }
  }
}

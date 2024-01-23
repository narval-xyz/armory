import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  createSignMessageSchema,
  readSignMessageSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-transaction.schema'
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
      read: readSignMessageSchema,
      create: createSignMessageSchema
    }
  },
  [SupportedAction.SIGN_TRANSACTION]: {
    action: SupportedAction.SIGN_TRANSACTION,
    schema: {
      read: readSignTransactionSchema,
      create: createSignTransactionSchema
    }
  }
}

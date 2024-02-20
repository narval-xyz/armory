import { Action } from '@narval/policy-engine-shared'
import { ZodType } from 'zod'
import { SupportedAction } from './core/type/domain.type'
import { createSignMessageSchema, readSignMessageSchema } from './persistence/schema/sign-message.schema'
import { createSignTransactionSchema, readSignTransactionSchema } from './persistence/schema/sign-transaction.schema'

type ActionRequestConfig = {
  action: SupportedAction
  schema: {
    read: ZodType
    create: ZodType
  }
}

export const ACTION_REQUEST = new Map<Action, ActionRequestConfig>([
  [
    Action.SIGN_MESSAGE,
    {
      action: Action.SIGN_MESSAGE,
      schema: {
        read: readSignMessageSchema,
        create: createSignMessageSchema
      }
    }
  ],
  [
    Action.SIGN_TRANSACTION,
    {
      action: Action.SIGN_TRANSACTION,
      schema: {
        read: readSignTransactionSchema,
        create: createSignTransactionSchema
      }
    }
  ]
])

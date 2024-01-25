import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  createSignMessageSchema,
  readSignMessageSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-transaction.schema'
import { Action } from '@narval/authz-shared'
import { ZodType } from 'zod'

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

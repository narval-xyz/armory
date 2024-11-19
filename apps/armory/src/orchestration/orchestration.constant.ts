import { Action, SupportedAction } from '@narval/policy-engine-shared'
import { ZodType } from 'zod'
import { createGrantPermissionSchema, readGrantPermissionSchema } from './persistence/schema/grant-permission.schema'
import {
  createSignMessageSchema,
  createSignRawSchema,
  readSignMessageSchema,
  readSignRawSchema
} from './persistence/schema/sign-message.schema'
import { createSignTransactionSchema, readSignTransactionSchema } from './persistence/schema/sign-transaction.schema'
import { createSignTypedDataSchema, readSignTypedDataSchema } from './persistence/schema/sign-typed-data.schema'
import { createSignUserOperationSchema, readSignUserOperationSchema } from './persistence/schema/sign-userop.schema'

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
  ],
  [
    Action.SIGN_RAW,
    {
      action: Action.SIGN_RAW,
      schema: {
        read: readSignRawSchema,
        create: createSignRawSchema
      }
    }
  ],
  [
    Action.SIGN_TYPED_DATA,
    {
      action: Action.SIGN_TYPED_DATA,
      schema: {
        read: readSignTypedDataSchema,
        create: createSignTypedDataSchema
      }
    }
  ],
  [
    Action.GRANT_PERMISSION,
    {
      action: Action.GRANT_PERMISSION,
      schema: {
        read: readGrantPermissionSchema,
        create: createGrantPermissionSchema
      }
    }
  ],
  [
    Action.SIGN_USER_OPERATION,
    {
      action: Action.SIGN_USER_OPERATION,
      schema: {
        read: readSignUserOperationSchema,
        create: createSignUserOperationSchema
      }
    }
  ]
])

export const OTEL_ATTR_JOB_ID = 'job.id'

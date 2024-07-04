import { z } from 'zod'
import {
  createSignMessageSchema,
  createSignRawSchema,
  readSignMessageSchema,
  readSignRawSchema
} from '../../persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '../../persistence/schema/sign-transaction.schema'
import { createGrantPermissionSchema, readGrantPermissionSchema } from './grant-permission.schema'
import { createSignUserOperationSchema, readSignUserOperationSchema } from './sign-userop.schema'

export const readRequestSchema = z.discriminatedUnion('action', [
  readSignTransactionSchema,
  readSignMessageSchema,
  readSignRawSchema,
  readGrantPermissionSchema,
  readSignUserOperationSchema
])

export const createRequestSchema = z.discriminatedUnion('action', [
  createSignTransactionSchema,
  createSignMessageSchema,
  createGrantPermissionSchema,
  createSignRawSchema,
  createSignUserOperationSchema
])

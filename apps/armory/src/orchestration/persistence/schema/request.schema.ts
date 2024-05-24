import { z } from 'zod'
import { createSignMessageSchema, readSignMessageSchema } from '../../persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '../../persistence/schema/sign-transaction.schema'
import { createGrantPermissionSchema, readGrantPermissionSchema } from './grant-permission.schema'

export const readRequestSchema = z.discriminatedUnion('action', [
  readSignTransactionSchema,
  readSignMessageSchema,
  readGrantPermissionSchema
])

export const createRequestSchema = z.discriminatedUnion('action', [
  createSignTransactionSchema,
  createSignMessageSchema,
  createGrantPermissionSchema
])

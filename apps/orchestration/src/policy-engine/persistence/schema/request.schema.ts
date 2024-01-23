import {
  createSignMessageSchema,
  readSignMessageSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-transaction.schema'
import { z } from 'zod'

export const readRequestSchema = z.discriminatedUnion('action', [readSignTransactionSchema, readSignMessageSchema])

export const createRequestSchema = z.discriminatedUnion('action', [
  createSignTransactionSchema,
  createSignMessageSchema
])

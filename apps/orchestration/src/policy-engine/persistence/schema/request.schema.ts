import { z } from 'zod'
import { createSignMessageSchema, readSignMessageSchema } from '../../persistence/schema/sign-message.schema'
import {
  createSignTransactionSchema,
  readSignTransactionSchema
} from '../../persistence/schema/sign-transaction.schema'

export const readRequestSchema = z.discriminatedUnion('action', [readSignTransactionSchema, readSignMessageSchema])

export const createRequestSchema = z.discriminatedUnion('action', [
  createSignTransactionSchema,
  createSignMessageSchema
])

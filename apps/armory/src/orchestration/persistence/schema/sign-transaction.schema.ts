import { Action } from '@narval/policy-engine-shared'
import { z } from 'zod'
import {
  createTransactionRequestSchema,
  readTransactionRequestSchema
} from '../../persistence/schema/transaction-request.schema'

export const readSignTransactionSchema = z.object({
  action: z.literal(Action.SIGN_TRANSACTION),
  nonce: z.string(),
  resourceId: z.string(),
  transactionRequest: readTransactionRequestSchema
})

export const createSignTransactionSchema = readSignTransactionSchema.extend({
  transactionRequest: createTransactionRequestSchema
})

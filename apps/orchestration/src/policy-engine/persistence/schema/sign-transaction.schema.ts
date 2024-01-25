import {
  createTransactionRequestSchema,
  readTransactionRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/transaction-request.schema'
import { Action } from '@narval/authz-shared'
import { z } from 'zod'

export const readSignTransactionSchema = z.object({
  action: z.literal(Action.SIGN_TRANSACTION),
  nonce: z.string(),
  resourceId: z.string(),
  transactionRequest: readTransactionRequestSchema
})

export const createSignTransactionSchema = readSignTransactionSchema.extend({
  transactionRequest: createTransactionRequestSchema
})

import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  createTransactionRequestSchema,
  readTransactionRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/transaction-request.schema'
import { z } from 'zod'

export const readSignTransactionSchema = z.object({
  action: z.literal(SupportedAction.SIGN_TRANSACTION),
  nonce: z.string(),
  resourceId: z.string(),
  transactionRequest: readTransactionRequestSchema
})

export const createSignTransactionSchema = readSignTransactionSchema.extend({
  transactionRequest: createTransactionRequestSchema
})

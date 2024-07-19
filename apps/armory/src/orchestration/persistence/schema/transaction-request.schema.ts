import {
  SerializedTransactionRequest,
  TransactionRequest,
  addressSchema,
  hexSchema
} from '@narval/policy-engine-shared'
import { z } from 'zod'

export const accessListSchema = z.object({
  address: addressSchema,
  storageKeys: z.array(hexSchema)
})

export const readTransactionRequestSchema = TransactionRequest

export const createTransactionRequestSchema = SerializedTransactionRequest

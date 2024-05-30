import { addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { z } from 'zod'
import { chainIdSchema } from '../../../shared/schema/chain-id.schema'

export const accessListSchema = z.object({
  address: addressSchema,
  storageKeys: z.array(hexSchema)
})

export const readTransactionRequestSchema = z.object({
  chainId: chainIdSchema,
  from: addressSchema,
  nonce: z.coerce.number().optional(),
  accessList: z.array(accessListSchema).optional(),
  data: hexSchema.optional(),
  gas: z.coerce.bigint().min(BigInt(0)).optional(),
  maxFeePerGas: z.coerce.bigint().min(BigInt(0)).optional(),
  maxPriorityFeePerGas: z.coerce.bigint().min(BigInt(0)).optional(),
  to: addressSchema.optional(),
  type: z.literal('2').optional(),
  value: hexSchema.optional()
})

export const createTransactionRequestSchema = readTransactionRequestSchema.extend({
  gas: z.coerce.string().optional(),
  maxFeePerGas: z.coerce.string().optional(),
  maxPriorityFeePerGas: z.coerce.string().optional()
})

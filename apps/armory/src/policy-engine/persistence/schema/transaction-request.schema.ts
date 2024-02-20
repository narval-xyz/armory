import { z } from 'zod'
import { addressSchema } from '../../../shared/schema/address.schema'
import { chainIdSchema } from '../../../shared/schema/chain-id.schema'
import { hexSchema } from '../../../shared/schema/hex.schema'

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
  to: addressSchema.optional(),
  type: z.literal('2').optional(),
  value: hexSchema.optional()
})

export const createTransactionRequestSchema = readTransactionRequestSchema.extend({
  gas: z.coerce.string().optional()
})

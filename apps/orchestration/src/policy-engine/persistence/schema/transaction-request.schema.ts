import { chainIdSchema } from '@app/orchestration/shared/schema/chain-id.schema'
import { isAddress } from '@narval/authz-shared'
import { isHex } from 'viem'
import { z } from 'zod'

/**
 * Schema backward compatible with viem's Address type.
 *
 * @see https://viem.sh/docs/glossary/types#address
 */
export const addressSchema = z.custom<`0x${string}`>(
  (value) => {
    const parse = z.string().safeParse(value)

    if (parse.success) {
      return isAddress(parse.data)
    }

    return false
  },
  {
    message: 'value is an invalid Ethereum address'
  }
)

/**
 * Schema backward compatible with viem's Hex type.
 *
 * @see https://viem.sh/docs/glossary/types#hex
 */
export const hexSchema = z.custom<`0x${string}`>(
  (value) => {
    const parse = z.string().safeParse(value)

    if (parse.success) {
      return isHex(parse.data)
    }

    return false
  },
  {
    message: 'value is an invalid hexadecimal'
  }
)

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

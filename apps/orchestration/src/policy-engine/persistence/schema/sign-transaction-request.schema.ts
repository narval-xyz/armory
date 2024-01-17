import { TransactionType } from '@app/orchestration/policy-engine/core/type/domain.type'
import { isAddress, isHex } from 'viem'
import { z } from 'zod'

/**
 * Schema backward compatible with viem's Address type.
 *
 * @see https://viem.sh/docs/glossary/types#address
 */
const addressSchema = z.custom<`0x${string}`>(
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
const hexSchema = z.custom<`0x${string}`>(
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

const accessListSchema = z.object({
  address: addressSchema,
  storageKeys: z.array(hexSchema)
})

export const readSignTransactionRequestSchema = z.object({
  chainId: z.coerce.number(),
  from: addressSchema,
  nonce: z.coerce.number(),
  accessList: z.array(accessListSchema).optional(),
  data: hexSchema.optional(),
  gas: z.coerce.bigint().optional(),
  to: addressSchema.optional(),
  type: z.nativeEnum(TransactionType).optional(),
  value: hexSchema.optional()
})

export const createSignTransactionRequestSchema = readSignTransactionRequestSchema.extend({
  gas: z.coerce.string().optional()
})

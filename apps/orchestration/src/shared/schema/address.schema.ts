import { isAddress } from '@narval/authz-shared'
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

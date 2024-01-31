import { isHex } from 'viem'
import { z } from 'zod'

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

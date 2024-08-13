import { z } from 'zod'
import { isAddress } from '../util/evm.util'

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

export const lowerCasedAddress = z
  .custom<`0x${string}`>(
    (value) => {
      if (typeof value === 'string') {
        const lowerCasedValue = value.toLowerCase()
        return isAddress(lowerCasedValue)
      }
      return false
    },
    {
      message: 'value is an invalid Ethereum address'
    }
  )
  .transform((value) => value.toLowerCase() as `0x${string}`)

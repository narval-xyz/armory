import { z } from 'zod'

export const Bip44Options = z.object({
  addressIndex: z.number().optional(),
  path: z.string().optional()
})
export type Bip44Options = z.infer<typeof Bip44Options>

export const BIP44_PREFIX = "m/44'/60'/0'/0/"
export const DerivationPath = z.custom<`${typeof BIP44_PREFIX}${number}`>(
  (value) => {
    if (typeof value !== 'string') return false

    if (!value.startsWith(BIP44_PREFIX)) return false

    // Extract the part after the prefix and check if it's a number
    const suffix = value.slice(BIP44_PREFIX.length)
    const isNumber = /^\d+$/.test(suffix)
    return isNumber
  },
  {
    message: `Derivation path must start with ${BIP44_PREFIX} and end with an index`
  }
)
export type DerivationPath = z.infer<typeof DerivationPath>

export const Bip44Index = DerivationPath.transform((data) => {
  const suffix = data.slice(BIP44_PREFIX.length)
  const index = Number(suffix)

  return index
})
export type Bip44Index = z.infer<typeof Bip44Index>

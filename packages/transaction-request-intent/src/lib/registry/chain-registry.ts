import { z } from 'zod'

export const ChainId = z.coerce.number().int()
export const ChainData = z.object({
  nativeSlip44: z.coerce.number().int()
})

export type ChainId = z.infer<typeof ChainId>
export type ChainData = z.infer<typeof ChainData>

export const ChainRegistryInput = z.record(z.string(), ChainData)
export type ChainRegistryInput = z.infer<typeof ChainRegistryInput>

export class ChainRegistry extends Map<ChainId, ChainData> {
  constructor(input?: ChainRegistryInput) {
    if (!input) {
      super()
      return
    }
    const validInput = ChainRegistryInput.parse(input)

    const entries = Object.entries(validInput).map(([chainId, chainData]): [ChainId, ChainData] => [
      ChainId.parse(chainId),
      ChainData.parse(chainData)
    ])

    super(entries)
  }
}

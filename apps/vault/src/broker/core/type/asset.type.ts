import { z } from 'zod'

export const Asset = z.object({
  decimals: z.number().nullable(),
  externalId: z.string(),
  name: z.string(),
  networkId: z.string(),
  onchainId: z.string().optional()
})
export type Asset = z.infer<typeof Asset>

import { z } from 'zod'
import { Provider } from './provider.type'

export const ExternalAsset = z.object({
  externalId: z.string(),
  provider: z.nativeEnum(Provider)
})
export type ExternalAsset = z.infer<typeof ExternalAsset>

export const Asset = z.object({
  assetId: z.string(),
  createdAt: z.date().optional(),
  decimals: z.number().nullable(),
  externalAssets: z.array(ExternalAsset).default([]),
  name: z.string(),
  networkId: z.string(),
  onchainId: z.string().toLowerCase().nullable(),
  symbol: z.string().nullable()
})
export type Asset = z.infer<typeof Asset>

import { AssetId } from '@narval/authz-shared'

export enum PriceSource {
  COINGECKO = 'COINGECKO'
}

export type FiatId = `fiat:${string}`

// Not sure about using a plain number wouldn't result in precision loss with
// crypto-to-crypto rates.
export type Price = Record<FiatId, number>

export type Prices = Record<AssetId, Price>

export type v2 = {
  prices: Map<FiatId, Map<AssetId, Price>>
  sourceId: PriceSource
  updatedAt: Date
}

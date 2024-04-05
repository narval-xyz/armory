import { AssetId } from '@narval/policy-engine-shared'

export type FiatId = `fiat:${string}`

// Not sure about using a plain number wouldn't result in precision loss with
// crypto-to-crypto rates.
export type Price = Record<FiatId, number | undefined>

export type Prices = Record<AssetId, Price | undefined>

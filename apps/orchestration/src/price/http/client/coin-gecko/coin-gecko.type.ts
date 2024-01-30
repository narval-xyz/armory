type CoinId = string

type Currency = 'usd'

type Option<Data> = {
  url?: string
  apiKey?: string
  data: Data
}

type Price = {
  [C in Currency]: number
}

// TODO: Change this before merge.
type ChangeMetadata = {
  [C in Currency as `${C}_24h_change`]?: number
}

type MarketCapMetadata = {
  [C in Currency as `${C}_market_cap`]?: number
}

type VolumeMetadata = {
  [C in Currency as `${C}_24h_vol`]?: number
}

export type SimplePriceOption = Option<{
  ids: string[]
  vs_currencies: string[]
  include_market_cap?: boolean
  include_24h_volume?: boolean
  include_24h_change?: boolean
  include_last_updated_at?: boolean
  precision?: number
}>

type SimplePriceMetadata = ChangeMetadata &
  MarketCapMetadata &
  VolumeMetadata & {
    last_updated_at?: number
  }

export type SimplePrice = Record<CoinId, Price & SimplePriceMetadata>

export type Coin = {
  id: string
  symbol: string
  name: string
  platforms: Record<string, string>
}

export type CoinList = Coin[]

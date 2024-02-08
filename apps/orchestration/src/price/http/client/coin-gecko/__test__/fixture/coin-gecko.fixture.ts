import { SimplePrice } from '../../coin-gecko.type'

export const generateSimplePrice = (): SimplePrice => {
  return {
    ethereum: {
      usd: 2272.194867253841,
      usd_market_cap: 272895913402.66522,
      usd_24h_vol: 6827306177.886258,
      usd_24h_change: -0.8104607737461819,
      last_updated_at: 1706524566
    },
    uniswap: {
      usd: 5.973969024087618,
      usd_market_cap: 4496856084.101798,
      usd_24h_vol: 74037282.24412505,
      usd_24h_change: -0.8629967474909083,
      last_updated_at: 1706524541
    }
  }
}

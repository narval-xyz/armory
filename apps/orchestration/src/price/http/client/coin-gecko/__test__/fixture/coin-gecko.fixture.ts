import { SimplePrice } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.type'

export const generateSimplePrice = (): SimplePrice => {
  return {
    ethereum: {
      usd: 2272.194867253841,
      usd_market_cap: 272895913402.66522,
      usd_24h_vol: 6827306177.886258,
      usd_24h_change: -0.8104607737461819,
      eur: 2101.0645108266203,
      eur_market_cap: 252292271940.76367,
      eur_24h_vol: 6313107613.0987625,
      eur_24h_change: -0.36025898833091113,
      last_updated_at: 1706524566
    },
    uniswap: {
      usd: 5.973969024087618,
      usd_market_cap: 4496856084.101798,
      usd_24h_vol: 74037282.24412505,
      usd_24h_change: -0.8629967474909083,
      eur: 5.522934362768995,
      eur_market_cap: 4157343449.752105,
      eur_24h_vol: 68447467.43469352,
      eur_24h_change: -0.4329575908228408,
      last_updated_at: 1706524541
    }
  }
}

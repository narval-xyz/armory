import { PriceException } from '@app/orchestration/price/core/exception/price.exception'
import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { SimplePrice } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.type'
import CoinGeckoAssetIdIndex from '@app/orchestration/price/resource/coin-gecko-asset-id-index.json'
import { CHAINS } from '@app/orchestration/shared/core/lib/chains.lib'
import { FiatId, Price } from '@app/orchestration/shared/core/type/price.type'
import { AssetId, getAssetId, isCoin, parseAsset } from '@narval/authz-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { compact } from 'lodash/fp'

type GetPricesOption = {
  from: AssetId[]
  to: FiatId[]
}

@Injectable()
export class PriceService {
  constructor(private coinGeckoClient: CoinGeckoClient) {}

  async getPrices(options: GetPricesOption): Promise<Price> {
    const from = options.from.map(this.getCoinGeckoId)

    if (from.some((id) => id === null)) {
      throw new PriceException({
        message: "Couldn't determine the source ID for the given asset ID",
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { options, from }
      })
    }

    const prices = await this.coinGeckoClient.getSimplePrice({
      data: {
        ids: compact(from),
        vs_currencies: options.to.map(this.getCoinGeckoCurrencyId),
        precision: 18
      }
    })

    return this.buildPrice(prices)
  }

  private buildPrice(prices: SimplePrice): Price {
    return Object.keys(prices).reduce((acc, coinId) => {
      const assetId = this.getAssetId(coinId)

      if (assetId) {
        return {
          ...acc,
          [assetId]: Object.keys(prices[coinId]).reduce((result, fiat) => {
            return {
              ...result,
              [`fiat:${fiat}`]: prices[coinId].usd
            }
          }, {})
        }
      }

      return acc
    }, {})
  }

  private getAssetId(coinId: string): AssetId | null {
    const chain = Object.values(CHAINS).find((chain) => chain.coinGecko.coinId === coinId)

    if (chain) {
      return chain.coin.id
    }

    for (const key in CoinGeckoAssetIdIndex) {
      if (CoinGeckoAssetIdIndex[key as keyof typeof CoinGeckoAssetIdIndex] === coinId) {
        return getAssetId(key)
      }
    }

    return null
  }

  private getCoinGeckoId(assetId: AssetId): string | null {
    const asset = parseAsset(assetId)
    const chain = CHAINS[asset.chainId]

    if (!chain) {
      return null
    }

    if (isCoin(asset)) {
      return chain.coinGecko.coinId
    }

    return CoinGeckoAssetIdIndex[assetId as keyof typeof CoinGeckoAssetIdIndex] || null
  }

  private getCoinGeckoCurrencyId(fiat: FiatId): string {
    return fiat.replace('fiat:', '')
  }
}

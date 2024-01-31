import { PriceException } from '@app/orchestration/price/core/exception/price.exception'
import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { SimplePrice } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.type'
import { CoinGeckoAssetRepository } from '@app/orchestration/price/persistence/repository/coin-gecko-asset.repository'
import { FiatId, Prices } from '@app/orchestration/shared/core/type/price.type'
import { AssetId } from '@narval/authz-shared'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { compact } from 'lodash/fp'

type GetPricesOption = {
  from: AssetId[]
  to: FiatId[]
}

@Injectable()
export class PriceService {
  private logger = new Logger(PriceService.name)

  constructor(private coinGeckoClient: CoinGeckoClient, private coinGeckoAssetRepository: CoinGeckoAssetRepository) {}

  async getPrices(options: GetPricesOption): Promise<Prices> {
    this.logger.log('Get prices', options)

    const from = options.from.map(this.coinGeckoAssetRepository.getSourceId)

    if (from.some((id) => id === null)) {
      throw new PriceException({
        message: "Couldn't determine the source ID for the given asset ID",
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { options, from }
      })
    }

    const simplePrice = await this.coinGeckoClient.getSimplePrice({
      data: {
        ids: compact(from),
        vs_currencies: options.to.map(this.coinGeckoAssetRepository.getFiatId),
        precision: 18
      }
    })

    const prices = this.buildPrices(simplePrice)

    this.logger.log('Received prices', {
      options,
      prices
    })

    return prices
  }

  private buildPrices(prices: SimplePrice): Prices {
    return Object.keys(prices).reduce((acc, coinId) => {
      const assetId = this.coinGeckoAssetRepository.getAssetId(coinId)

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
}

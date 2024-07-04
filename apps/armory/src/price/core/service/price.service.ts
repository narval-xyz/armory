import { LoggerService } from '@narval/nestjs-shared'
import { AssetId } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { FiatId, Prices } from '../../../shared/core/type/price.type'
import { CoinGeckoClient } from '../../http/client/coin-gecko/coin-gecko.client'
import { SimplePrice } from '../../http/client/coin-gecko/coin-gecko.type'
import { CoinGeckoAssetRepository } from '../../persistence/repository/coin-gecko-asset.repository'

type GetPricesOption = {
  from: AssetId[]
  to: FiatId[]
}

@Injectable()
export class PriceService {
  constructor(
    private coinGeckoClient: CoinGeckoClient,
    private coinGeckoAssetRepository: CoinGeckoAssetRepository,
    private logger: LoggerService
  ) {}

  /* eslint-disable no-unused-vars */
  async getPrices(options: GetPricesOption): Promise<Prices> {
    return {}
  }

  // TODO: (@samteb, 04/07/24) Disable prices for now because it adds dependency on coingecko
  // async getPrices(options: GetPricesOption): Promise<Prices> {
  // this.logger.log('Get prices', options)
  // const from = options.from.map(this.coinGeckoAssetRepository.getSourceId)
  // if (from.some((id) => id === null)) {
  //   throw new PriceException({
  //     message: "Couldn't determine the source ID for the given asset ID",
  //     suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
  //     context: { options, from }
  //   })
  // }
  // const simplePrice = await this.coinGeckoClient.getSimplePrice({
  //   data: {
  //     ids: compact(from),
  //     vs_currencies: options.to.map(this.coinGeckoAssetRepository.getFiatId),
  //     precision: 18
  //   }
  // })
  // const prices = this.buildPrices(options.from, simplePrice)
  // this.logger.log('Received prices', {
  //   options,
  //   prices
  // })
  // return prices
  // }

  // TODO (@wcalderipe, 05/02/24): Move everything related to CoinGecko to a
  // Price repository if one day we have another price source or cache.

  private buildPrices(assetIds: AssetId[], simplePrice: SimplePrice): Prices {
    return (
      this.getAssetsPriceInformation(simplePrice)
        // Assets with the same address on different chains have the same source ID
        // but different asset ID. This filter removes unrequested asset IDs.
        .filter(({ sourceAssetId }) => assetIds.includes(sourceAssetId))
        .reduce((acc, price) => {
          return {
            ...acc,
            [price.sourceAssetId]: price.values
          }
        }, {})
    )
  }

  private getAssetsPriceInformation(simplePrice: SimplePrice) {
    return Object.keys(simplePrice).reduce(
      (acc, coinId) => {
        const sourceAssetIds = this.coinGeckoAssetRepository.getAssetIds(coinId)

        if (sourceAssetIds) {
          return [
            ...acc,
            ...sourceAssetIds.map((sourceAssetId) => ({
              sourceAssetId,
              coinId,
              values: this.getValues(simplePrice, coinId)
            }))
          ]
        }

        return acc
      },
      [] as { sourceAssetId: AssetId; coinId: string; values: unknown }[]
    )
  }

  private getValues(simplePrice: SimplePrice, coinId: string) {
    return Object.keys(simplePrice[coinId]).reduce((prices, price) => {
      const value = simplePrice[coinId][price as keyof (typeof simplePrice)[string]]

      if (price) {
        return {
          ...prices,
          [`fiat:${price}`]: value
        }
      }

      return prices
    }, {})
  }
}

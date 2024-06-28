/**
 * Generates an CAIP Asset ID to coin ID index using CoinGecko API to make price
 * queries faster and easier.
 */
import { LoggerService } from '@narval/nestjs-shared'
import { AssetId, AssetType, getAddress, isAddress, toAssetId } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import File from 'fs'
import { compact, flatten, pick } from 'lodash/fp'
import { concatMap, filter, from, lastValueFrom, map, mergeMap, reduce, tap } from 'rxjs'
import { Address } from 'viem'
import { CHAINS } from '../../armory.constant'
import { Chain, findChain } from '../../shared/core/lib/chains.lib'
import { CoinGeckoClient } from '../http/client/coin-gecko/coin-gecko.client'
import { Coin } from '../http/client/coin-gecko/coin-gecko.type'

const logger = new LoggerService()

const supportedPlatforms = Array.from(CHAINS.values()).map(({ coinGecko }) => coinGecko.platform)

const chainsByPlatform = Array.from(CHAINS.values()).reduce((acc, chain) => {
  return acc.set(chain.coinGecko.platform, chain)
}, new Map<string, Chain>())

const isSupported = (coin: Coin) =>
  Boolean(findChain((chain) => Object.keys(coin.platforms).includes(chain.coinGecko.platform)))

const selectPlatforms =
  (platforms: string[]) =>
  (coin: Coin): Coin => {
    return {
      ...coin,
      platforms: pick(platforms, coin.platforms)
    }
  }

const buildAsset = ({
  chainId,
  address,
  id
}: {
  chainId?: number
  address: string
  id: string
}): { success: true; id: string; assetId: AssetId } | { success: false; id: string; address: string } => {
  if (chainId && isAddress(address)) {
    return {
      success: true,
      id,
      assetId: toAssetId({
        chainId: chainId,
        address: getAddress(address).toLowerCase() as Address,
        // IMPORTANT: Assume all assets are ERC-20 is likely wrong.
        assetType: AssetType.ERC20
      })
    }
  }

  return {
    success: false,
    id,
    address
  }
}

const buildAssets = (coin: Coin) => {
  return flatten(
    compact(
      Object.keys(coin.platforms).map((platform) => {
        const chain = chainsByPlatform.get(platform)
        const address = coin.platforms[platform]

        return buildAsset({
          id: coin.id,
          chainId: chain?.id,
          address
        })
      })
    )
  )
}

const encode = (dictionary: Record<AssetId, string>) => JSON.stringify(dictionary, null, 1)

const run = async () => {
  const client = new CoinGeckoClient(new HttpService(), logger)

  return lastValueFrom(
    from(client.getCoinList()).pipe(
      concatMap((coinList) => coinList),
      filter(isSupported),
      map(selectPlatforms(supportedPlatforms)),
      mergeMap(buildAssets),
      tap((coin) => {
        if (!coin.success) {
          logger.warn('Build asset failed', coin)
        }
      }),
      filter((coin) => coin.success),
      reduce((acc, coin) => {
        if (coin.success) {
          return {
            ...acc,
            [coin.assetId]: coin.id
          }
        }

        return acc
      }, {}),
      tap((dictionary) => {
        const file = 'apps/armory/src/price/resource/coin-gecko-asset-id-index.json'

        File.writeFileSync(file, encode(dictionary))

        logger.log('Asset ID to Coin ID dictionary generated', {
          file,
          total: Object.keys(dictionary).length
        })
      })
    )
  )
}

run()
  .then(() => logger.log('Done'))
  .catch((error) => logger.error('Failed', error))

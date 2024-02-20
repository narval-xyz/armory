import { AssetId, getAssetId, isCoin, parseAsset } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { findChain, safeGetChain } from '../../../shared/core/lib/chains.lib'
import { FiatId } from '../../../shared/core/type/price.type'
import CoinGeckoAssetIdIndex from '../../resource/coin-gecko-asset-id-index.json'

@Injectable()
export class CoinGeckoAssetRepository {
  getSourceId(assetId: AssetId): string | null {
    const asset = parseAsset(assetId)
    const chain = safeGetChain(asset.chainId)

    if (chain && isCoin(asset)) {
      return chain.coinGecko.coinId
    }

    return CoinGeckoAssetIdIndex[assetId as keyof typeof CoinGeckoAssetIdIndex] || null
  }

  getAssetIds(sourceId: string): AssetId[] | null {
    const chain = findChain(({ coinGecko }) => coinGecko.coinId === sourceId)

    if (chain) {
      return [chain.coin.id]
    }

    // Assets with the same address on different chains have the same source ID
    // but different asset ID.
    const assetIds = Object.keys(CoinGeckoAssetIdIndex).filter(
      (assetId) => CoinGeckoAssetIdIndex[assetId as keyof typeof CoinGeckoAssetIdIndex] === sourceId
    )

    if (assetIds.length) {
      return assetIds.map(getAssetId)
    }

    return null
  }

  getFiatId(fiat: FiatId): string {
    return fiat.replace('fiat:', '')
  }
}

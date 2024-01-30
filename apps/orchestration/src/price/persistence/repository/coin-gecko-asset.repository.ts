import CoinGeckoAssetIdIndex from '@app/orchestration/price/resource/coin-gecko-asset-id-index.json'
import { findChain, safeGetChain } from '@app/orchestration/shared/core/lib/chains.lib'
import { FiatId } from '@app/orchestration/shared/core/type/price.type'
import { AssetId, getAssetId, isCoin, parseAsset } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CoinGeckoAssetRepository {
  getSourceId(assetId: AssetId): string | null {
    const asset = parseAsset(assetId)
    const chain = safeGetChain(asset.chainId)

    if (!chain) {
      return null
    }

    if (isCoin(asset)) {
      return chain.coinGecko.coinId
    }

    return CoinGeckoAssetIdIndex[assetId as keyof typeof CoinGeckoAssetIdIndex] || null
  }

  getAssetId(sourceId: string): string | null {
    const chain = findChain(({ coinGecko }) => coinGecko.coinId === sourceId)

    if (chain) {
      return chain.coin.id
    }

    for (const key in CoinGeckoAssetIdIndex) {
      if (CoinGeckoAssetIdIndex[key as keyof typeof CoinGeckoAssetIdIndex] === sourceId) {
        return getAssetId(key)
      }
    }

    return null
  }

  getFiatId(fiat: FiatId): string {
    return fiat.replace('fiat:', '')
  }
}

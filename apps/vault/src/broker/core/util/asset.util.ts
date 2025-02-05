import { Asset, ExternalAsset } from '../type/asset.type'
import { Provider } from '../type/provider.type'

export const getExternalAsset = (asset: Asset, provider: Provider): ExternalAsset | null => {
  return asset.externalAssets.find((externalAsset) => externalAsset.provider === provider) || null
}

export const isNativeAsset = (asset: Asset): boolean => {
  return asset.onchainId === null
}

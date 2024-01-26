import { Address, getAddress, isAddress } from 'viem'
import { toEnum } from './enum.util'

//
// Type
//

export enum ErrorCode {
  ASSET_IS_NOT_A_COIN = 'ASSET_IS_NOT_A_COIN',
  ASSET_IS_NOT_A_TOKEN = 'ASSET_IS_NOT_A_TOKEN',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_CAIP_10_FORMAT = 'INVALID_CAIP_10_FORMAT',
  INVALID_CAIP_19_ASSET_TYPE = 'INVALID_CAIP_19_ASSET_TYPE',
  INVALID_CAIP_19_FORMAT = 'INVALID_CAIP_19_FORMAT',
  INVALID_NAMESPACE = 'INVALID_NAMESPACE'
}

/**
 * Supported namespaces by Narval.
 */
export enum Namespace {
  EIP155 = 'eip155'
}

/**
 * Supported asset types by Narval.
 */
export enum AssetType {
  ERC1155 = 'erc1155',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  SLIP44 = 'slip44'
}

/**
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md
 */
export type AccountId = `${Namespace}:${number}/${string}`

export type Account = {
  chainId: number
  address: Address
  namespace: Namespace
}

/**
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-20.md
 * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */
export type AssetId =
  | `${Namespace}:${number}/${AssetType}:${string}`
  | `${Namespace}:${number}/${AssetType}:${string}/${string}`
  | `${Namespace}:${number}/${AssetType.SLIP44}:${number}`

export type Token = Account & {
  assetType: AssetType
  assetId?: string
}

export type Coin = {
  namespace: Namespace
  chainId: number
  assetType: AssetType.SLIP44
  coinType: number
}

export type Asset = Coin | Token

type Result<Value> =
  | {
      success: false
      error: ErrorCode
    }
  | { success: true; value: Value }

export class CaipError extends Error {
  constructor(error: ErrorCode) {
    super(error.toString())

    this.name = CaipError.name
  }
}

const getNamespace = (value: string): Namespace | null => toEnum(Namespace, value.toUpperCase())

const unsafeParse = <T>(fn: (value: string) => Result<T>, value: string): T => {
  const result = fn(value)

  if (result.success) {
    return result.value
  }

  throw new CaipError(result.error)
}

//
// Account ID
//

const matchAccountId = (value: string) => {
  const match = value.match(/^([^:]+):(\d+)\/(.+)$/)

  if (!match) {
    return null
  }

  return {
    namespace: match[1],
    chainId: Number(match[2]),
    address: match[3]
  }
}

export const safeParseAccount = (value: string): Result<Account> => {
  const match = matchAccountId(value)

  if (!match) {
    return {
      success: false,
      error: ErrorCode.INVALID_CAIP_10_FORMAT
    }
  }

  const namespace = getNamespace(match.namespace)

  if (!namespace) {
    return {
      success: false,
      error: ErrorCode.INVALID_NAMESPACE
    }
  }

  if (!isAddress(match.address)) {
    return {
      success: false,
      error: ErrorCode.INVALID_ADDRESS
    }
  }

  const address = getAddress(match.address)

  return {
    success: true,
    value: {
      namespace,
      address,
      chainId: match.chainId
    }
  }
}

export const safeGetAccountId = (value: string): Result<AccountId> => {
  const result = safeParseAccount(value)

  if (result.success) {
    return {
      success: true,
      value: toAccountId(result.value)
    }
  }

  return result
}

export const parseAccount = (value: string): Account => unsafeParse<Account>(safeParseAccount, value)

export const getAccountId = (value: string): AccountId => unsafeParse<AccountId>(safeGetAccountId, value)

export const toAccountId = ({ namespace = Namespace.EIP155, chainId, address }: Account): AccountId =>
  `${namespace}:${chainId}/${address}`

//
// Asset ID
//

const getAssetType = (value: string): AssetType | null => toEnum(AssetType, value.toUpperCase())

const matchAssetId = (value: string) => {
  const match = value.match(/^([^:]+):(\d+)\/([^:]+):([^/]+)(?:\/([^/]+))?$/)

  if (!match) {
    return null
  }

  return {
    namespace: match[1],
    chainId: Number(match[2]),
    assetType: match[3],
    address: match[4],
    assetId: match[5]
  }
}

export const safeParseAsset = (value: string): Result<Asset> => {
  const match = matchAssetId(value)

  if (!match) {
    return {
      success: false,
      error: ErrorCode.INVALID_CAIP_19_FORMAT
    }
  }

  const namespace = getNamespace(match.namespace)

  if (!namespace) {
    return {
      success: false,
      error: ErrorCode.INVALID_NAMESPACE
    }
  }

  const assetType = getAssetType(match.assetType)

  if (!assetType) {
    return {
      success: false,
      error: ErrorCode.INVALID_CAIP_19_ASSET_TYPE
    }
  }

  if (assetType === AssetType.SLIP44) {
    return {
      success: true,
      value: {
        namespace,
        chainId: match.chainId,
        assetType: AssetType.SLIP44,
        coinType: Number(match.address)
      }
    }
  }

  if (!isAddress(match.address)) {
    return {
      success: false,
      error: ErrorCode.INVALID_ADDRESS
    }
  }

  const address = getAddress(match.address)

  return {
    success: true,
    value: {
      namespace,
      chainId: match.chainId,
      assetType,
      address,
      assetId: match.assetId
    }
  }
}

export const isToken = (asset: Asset): asset is Token => {
  return asset.assetType !== AssetType.SLIP44
}

export const isCoin = (asset: Asset): asset is Coin => {
  return asset.assetType === AssetType.SLIP44
}

export const safeParseToken = (value: string): Result<Token> => {
  const result = safeParseAsset(value)

  if (result.success) {
    const asset = result.value

    if (isToken(asset)) {
      return {
        success: true,
        value: asset
      }
    }
  }

  return {
    success: false,
    error: ErrorCode.ASSET_IS_NOT_A_TOKEN
  }
}

export const safeParseCoin = (value: string): Result<Coin> => {
  const result = safeParseAsset(value)

  if (result.success) {
    const asset = result.value

    if (isCoin(asset)) {
      return {
        success: true,
        value: asset
      }
    }
  }

  return {
    success: false,
    error: ErrorCode.ASSET_IS_NOT_A_COIN
  }
}

export const parseAsset = (value: string): Asset => unsafeParse<Asset>(safeParseAsset, value)

export const parseCoin = (value: string): Coin => unsafeParse<Coin>(safeParseCoin, value)

export const parseToken = (value: string): Token => unsafeParse<Token>(safeParseToken, value)

export const toAssetId = (asset: Asset): AssetId => {
  if (isCoin(asset)) {
    return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.coinType}`
  }

  if (asset.assetId) {
    return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.address}/${asset.assetId}`
  }

  return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.address}`
}

export const safeGetAssetId = (value: string): Result<AssetId> => {
  const result = safeParseAsset(value)

  if (result.success) {
    return {
      success: true,
      value: toAssetId(result.value)
    }
  }

  return result
}

export const getAssetId = (value: string): AssetId => unsafeParse<AssetId>(safeGetAssetId, value)

import { SetOptional } from 'type-fest'
import { Address } from 'viem'
import { z } from 'zod'
import { toEnum } from './enum.util'
import { getAddress, isAddress } from './evm.util'

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

const NonCollectableAssetId = z.custom<`${Namespace}:${number}/${AssetType}:${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

const CollectableAssetId = z.custom<`${Namespace}:${number}/${AssetType}:${string}/${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

const CoinAssetId = z.custom<`${Namespace}:${number}/${AssetType.SLIP44}:${number}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isAssetId(parse.data)
  }

  return false
})

export const AssetId = z.union([NonCollectableAssetId, CollectableAssetId, CoinAssetId])

/**
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md
 */
export const ChainAccountId = z.custom<`${Namespace}:${number}:${string}`>((value) => {
  const parse = z.string().safeParse(value)

  if (parse.success) {
    return isChainAccountId(parse.data)
  }

  return false
})

export type ChainAccountId = z.infer<typeof ChainAccountId>

export type ChainAccount = {
  chainId: number
  address: Address
  namespace: Namespace
}

/**
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-20.md
 * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */
export type AssetId = z.infer<typeof AssetId>

export type Token = ChainAccount & {
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

const matchChainAccountId = (value: string) => {
  const match = value.match(/^([^:]+):(\d+):(.+)$/)

  if (!match) {
    return null
  }

  return {
    namespace: match[1],
    chainId: Number(match[2]),
    address: match[3]
  }
}

/**
 * Safely parses an account value and returns the result.
 *
 * @param value The account value to parse.
 * @returns The result of parsing the account value.
 */
export const safeParseChainAccount = (value: string): Result<ChainAccount> => {
  const match = matchChainAccountId(value)

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

/**
 * Safely gets the account ID from a string value.
 *
 * @param value - The string value to parse.
 * @returns A Result object containing the account ID if successful, or an error if unsuccessful.
 */
export const safeGetChainAccountId = (value: string): Result<ChainAccountId> => {
  const result = safeParseChainAccount(value)

  if (result.success) {
    return {
      success: true,
      value: toChainAccountId(result.value)
    }
  }

  return result
}

/**
 * Parses the account value.
 *
 * @param value - The value to parse.
 * @throws {CaipError}
 * @returns The parsed account.
 */
export const parseChainAccount = (value: string): ChainAccount =>
  unsafeParse<ChainAccount>(safeParseChainAccount, value)

/**
 * Parses the value and returns the AccountId.
 *
 * @param value - The value to parse.
 * @throws {CaipError}
 * @returns The parsed AccountId.
 */
export const getChainAccountId = (value: string): ChainAccountId =>
  unsafeParse<ChainAccountId>(safeGetChainAccountId, value)

/**
 * Converts an Account object to an AccountId string.
 *
 * @param {SetOptional<ChainAccount, 'namespace'>} account - The Account object to convert.
 * @returns {ChainAccountId} The converted AccountId string.
 */
export const toChainAccountId = (input: SetOptional<ChainAccount, 'namespace'>): ChainAccountId => {
  const account: ChainAccount = {
    ...input,
    namespace: input.namespace || Namespace.EIP155
  }

  return `${account.namespace}:${account.chainId}:${account.address}`
}

/**
 * Checks if the given value is a valid account ID.
 *
 * @param value The value to check.
 * @returns True if the value is a valid account ID, false otherwise.
 */
export const isChainAccountId = (value: string): boolean => safeParseChainAccount(value).success

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

/**
 * Safely parses a CAIP asset string and returns the result.
 *
 * @param value The CAIP asset string to parse.
 * @returns The result of parsing the CAIP asset string.
 */
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

/**
 * Checks if a given value is a valid asset ID.
 *
 * @param value The value to check.
 * @returns A boolean indicating whether the value is a valid asset ID.
 */
export const isAssetId = (value: string): boolean => safeParseAsset(value).success

/**
 * Checks if the given asset is a token.
 *
 * @param asset The asset to check.
 * @returns True if the asset is a token, false otherwise.
 */
export const isToken = (asset: Asset): asset is Token => {
  return asset.assetType !== AssetType.SLIP44
}

/**
 * Checks if the given asset is a Coin.
 *
 * @param asset The asset to check.
 * @returns True if the asset is a Coin, false otherwise.
 */
export const isCoin = (asset: Asset): asset is Coin => {
  return asset.assetType === AssetType.SLIP44
}

/**
 * Safely parses a token value.
 *
 * @param value - The token value to parse.
 * @returns The result of parsing the token value.
 */
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

/**
 * Safely parses a string value into a Coin object.
 *
 * @param value - The string value to parse.
 * @returns A Result object containing the parsed Coin if successful, or an error code if unsuccessful.
 */
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

/**
 * Parses the asset from a string value.
 *
 * @param value - The string value to parse.
 * @throws {CaipError}
 * @returns The parsed asset.
 */
export const parseAsset = (value: string): Asset => unsafeParse<Asset>(safeParseAsset, value)

/**
 * Parses a string value into a Coin object.
 *
 * @param value The string value to parse.
 * @throws {CaipError}
 * @returns The parsed Coin object.
 */
export const parseCoin = (value: string): Coin => unsafeParse<Coin>(safeParseCoin, value)

/**
 * Parses a token value.
 *
 * @param value - The token value to parse.
 * @throws {CaipError}
 * @returns The parsed token.
 */
export const parseToken = (value: string): Token => unsafeParse<Token>(safeParseToken, value)

/**
 * Converts an asset object to an asset ID string.
 *
 * @param input The asset object to convert.
 * @returns The asset ID string.
 */
export const toAssetId = (input: SetOptional<Asset, 'namespace'>): AssetId => {
  const asset: Asset = {
    ...input,
    namespace: input.namespace || Namespace.EIP155
  }

  if (isCoin(asset)) {
    return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.coinType}`
  }

  if (asset.assetId) {
    return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.address}/${asset.assetId}`
  }

  return `${asset.namespace}:${asset.chainId}/${asset.assetType}:${asset.address}`
}

/**
 * Safely retrieves the asset ID from a given value.
 *
 * @param value The value to parse and retrieve the asset ID from.
 * @returns A Result object containing the success status and the asset ID value.
 */
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

/**
 * Parses the given value and returns the corresponding AssetId.
 *
 * @param value The value to parse.
 * @throws {CaipError}
 * @returns The parsed AssetId.
 */
export const getAssetId = (value: string): AssetId => unsafeParse<AssetId>(safeGetAssetId, value)

//
// Zod Schema
//

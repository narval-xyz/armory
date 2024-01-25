import { SetOptional } from 'type-fest'
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

type Caip10Input = {
  address: Address
  chainId: number
  namespace?: Namespace
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

export enum Slip44SupportedAddresses {
  ETH = '60',
  MATIC = '966'
}

type Caip19Input = Caip10Input & {
  assetType: AssetType
  assetId?: string
  chainId: number
  namespace?: Namespace
  address: Address
}

type ParseResult<Value> =
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

/**
 * Safely parses an account value and returns the result.
 *
 * @param value The account value to parse.
 * @returns The result of parsing the account value.
 */
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

/**
 * Converts a Caip10Input object to a Caip10Id string.
 * 'namespace' is optional and defaults to 'eip155'.
 *
 * @param value - The string value to parse.
 * @returns A Result object containing the account ID if successful, or an error if unsuccessful.
 */
export const toCaip10 = ({ namespace = Namespace.EIP155, chainId, address }: Caip10Input): Caip10Id =>
  `${namespace}:${chainId}/${address}`
export const toCaip10Lower = ({ namespace = Namespace.EIP155, chainId, address }: Caip10Input): Caip10Id =>
  `${namespace}:${chainId}/${address.toLowerCase()}`
/**
 * Parses the account value.
 *
 * @param value - The value to parse.
 * @throws {CaipError}
 * @returns The parsed account.
 */
export const parseAccount = (value: string): Account => unsafeParse<Account>(safeParseAccount, value)

/**
 * Parses the value and returns the AccountId.
 *
 * @param value - The value to parse.
 * @throws {CaipError}
 * @returns The parsed AccountId.
 */
export const getAccountId = (value: string): AccountId => unsafeParse<AccountId>(safeGetAccountId, value)

/**
 * Converts an Account object to an AccountId string.
 *
 * @param {Account} account - The Account object to convert.
 * @returns {AccountId} The converted AccountId string.
 */
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

export const isCaip10Id = (value: string): value is Caip10Id => {
  const match = value.match(/^([^:]+):(\d+)\/(.+)$/)
  return !!match
}

export const isCaip19Id = (value: string): value is Caip19Id => {
  const match = value.match(/^([^:]+):(\d+)\/([^:]+):([^/]+)(?:\/([^/]+))?$/)
  return !!match
}

/**
 * Checks if the given asset is a token.
 *
 * @param asset The asset to check.
 * @returns True if the asset is a token, false otherwise.
 */
export const toCaip19 = ({
  namespace = Namespace.EIP155,
  chainId,
  assetType,
  address,
  assetId
}: Caip19Input): Caip19Id =>
  assetId
    ? `${namespace}:${chainId}/${assetType}:${address}/${assetId}`
    : `${namespace}:${chainId}/${assetType}:${address}`

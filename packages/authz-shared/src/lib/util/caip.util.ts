import { Address, getAddress, isAddress } from 'viem'
import { toEnum } from './enum.util'

export enum ParseError {
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
export type Caip10Id = `${Namespace}:${number}/${string}`

export type Caip10 = {
  chainId: number
  address: Address
  namespace: Namespace
}

/**
 * @see https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md
 */
export type Caip19Id =
  | `${Namespace}:${number}/${AssetType}:${string}`
  | `${Namespace}:${number}/${AssetType}:${string}/${string}`

export type Caip19 = Caip10 & {
  assetType: AssetType
  assetId?: string
}

type ParseResult<Value> =
  | {
      success: false
      error: ParseError
    }
  | { success: true; value: Value }

const getNamespace = (value: string): Namespace | null => toEnum(Namespace, value.toUpperCase())

const getAssetType = (value: string): AssetType | null => toEnum(AssetType, value.toUpperCase())

/**
 * Parses a CAIP-10 ID and returns the parsed result.
 *
 * @param caip10Id The CAIP-10 ID to parse.
 * @returns The parsed CAIP-10 result.
 */
export const parseCaip10 = (caip10Id: Caip10Id): ParseResult<Caip10> => {
  const match = caip10Id.match(/^([^:]+):(\d+)\/(.+)$/)

  if (!match) {
    return {
      success: false,
      error: ParseError.INVALID_CAIP_10_FORMAT
    }
  }

  const namespace = getNamespace(match[1])

  if (!namespace) {
    return {
      success: false,
      error: ParseError.INVALID_NAMESPACE
    }
  }

  if (!isAddress(match[3])) {
    return {
      success: false,
      error: ParseError.INVALID_ADDRESS
    }
  }

  const chainId = Number(match[2])
  const address = getAddress(match[3])

  return {
    success: true,
    value: {
      namespace,
      address,
      chainId
    }
  }
}

/**
 * Converts a Caip10 object to a Caip10Id string.
 *
 * @param caip10 The Caip10 object to convert.
 * @returns The Caip10Id string representation of the Caip10 object.
 */
export const toCaip10 = (caip10: Caip10): Caip10Id => `${caip10.namespace}:${caip10.chainId}/${caip10.address}`

/**
 * Parses a CAIP-19 ID and returns the parsed result.
 *
 * @param caip19Id The CAIP-19 ID to parse.
 * @returns The parsed CAIP-19 object or an error result.
 */
export const parseCaip19 = (caip19Id: Caip19Id): ParseResult<Caip19> => {
  const match = caip19Id.match(/^([^:]+):(\d+)\/([^:]+):([^/]+)(?:\/([^/]+))?$/)

  if (!match) {
    return {
      success: false,
      error: ParseError.INVALID_CAIP_19_FORMAT
    }
  }

  const namespace = getNamespace(match[1])

  if (!namespace) {
    return {
      success: false,
      error: ParseError.INVALID_NAMESPACE
    }
  }

  if (!isAddress(match[4])) {
    return {
      success: false,
      error: ParseError.INVALID_ADDRESS
    }
  }

  const assetType = getAssetType(match[3])

  if (!assetType) {
    return {
      success: false,
      error: ParseError.INVALID_CAIP_19_ASSET_TYPE
    }
  }

  const chainId = Number(match[2])
  const address = getAddress(match[4])
  const assetId = match[5]

  return {
    success: true,
    value: {
      namespace,
      chainId,
      assetType,
      address,
      assetId
    }
  }
}

/**
 * Converts a Caip19 object to a Caip19Id string representation.
 *
 * @param caip19 - The Caip19 object to convert.
 * @returns The Caip19Id string representation.
 */
export const toCaip19 = ({ namespace, chainId, assetType, address, assetId }: Caip19): Caip19Id =>
  assetId
    ? `${namespace}:${chainId}/${assetType}:${address}/${assetId}`
    : `${namespace}:${chainId}/${assetType}:${address}`

import { Hex, decodeAbiParameters } from 'viem'
import { TransactionRequestIntentError } from './error'
import {
  AmbiguousMethods,
  Erc1155Methods,
  Erc1155SafeBatchTransferFromAbiParameters,
  Erc1155SafeTransferFromAbiParameters,
  Erc20Methods,
  Erc20TransferAbiParameters,
  Erc721Methods,
  Erc721SafeTransferFromAbiParameters
} from './methodId'

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isBigInt = (value: unknown): value is bigint => {
  return typeof value === 'bigint'
}

export const assertBigInt = (value: unknown): bigint => {
  if (isBigInt(value)) {
    return value
  }
  throw new Error('Value is not a bigint')
}

function isHex(value: unknown): value is Hex {
  return isString(value) && value.startsWith('0x')
}

export const assertHexString = (value: unknown): Hex => {
  if (isHex(value)) {
    return value
  }
  throw new Error('Value is not a hex string')
}

function assertString(value: unknown): string {
  if (isString(value)) {
    return value
  }
  throw new Error('Value is not a string')
}

// Checks if a value is a number
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export const assertNumber = (value: unknown): number => {
  if (isNumber(value)) {
    return value
  }
  throw new Error('Value is not a number')
}

// Checks if a value is a boolean
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export const assertBoolean = (value: unknown): boolean => {
  if (isBoolean(value)) {
    return value
  }
  throw new Error('Value is not a boolean')
}

// Checks if a value is an array
export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value)
}

type AssertType = 'string' | 'bigint' | 'number' | 'boolean' | 'hex'

export const assertArray = <T>(value: unknown, type: AssertType): T[] => {
  if (!Array.isArray(value)) {
    throw new Error('Value is not an array')
  }
  switch (type) {
    case 'string': {
      return value.map(assertString) as T[]
    }
    case 'bigint': {
      return value.map(assertBigInt) as T[]
    }
    case 'number': {
      return value.map(assertNumber) as T[]
    }
    case 'boolean': {
      return value.map(assertBoolean) as T[]
    }
    case 'hex': {
      return value.map(assertHexString) as T[]
    }
    default: {
      return value
    }
  }
}

export const handleError = (context: object, message: string, e?: unknown): never => {
  throw new TransactionRequestIntentError({
    message,
    status: 400,
    context: { ...context, error: e }
  })
}

type TransferParams = {
  recipient: Hex
  amount: string
}
export const isTransferParams = (params: unknown): params is TransferParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'recipient' in params &&
    'amount' in params &&
    isString(params.recipient) &&
    isString(params.amount)
  )
}
export const extractTransferParamValues = (data: Hex, methodId: Hex): TransferParams => {
  const paramValues = decodeAbiParameters(Erc20TransferAbiParameters, data)
  try {
    const recipient = assertHexString(paramValues[0])
    const amount = assertBigInt(paramValues[1])
    return { recipient, amount: amount.toString().toLowerCase() }
  } catch (e) {
    return handleError({ data, methodId }, 'Invalid transfer params', e)
  }
}

type TransferFromParams = {
  sender: Hex
  recipient: Hex
  amount: string
}
export const isTransferFromParams = (params: unknown): params is TransferFromParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'sender' in params &&
    'recipient' in params &&
    'amount' in params &&
    isHex(params.sender) &&
    isHex(params.recipient) &&
    isString(params.amount)
  )
}
export const extractTransferFromParamValues = (data: Hex, methodId: Hex): TransferFromParams => {
  const paramValues = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, data)
  try {
    const sender = assertHexString(paramValues[0])
    const recipient = assertHexString(paramValues[1])
    const amount = assertBigInt(paramValues[2])
    return { sender, recipient, amount: amount.toString().toLowerCase() }
  } catch (e) {
    return handleError({ data, methodId }, 'Invalid transfer from params', e)
  }
}

type Erc721SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: bigint
}
export const isErc721SafeTransferFromParams = (params: unknown): params is Erc721SafeTransferFromParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'from' in params &&
    'to' in params &&
    'tokenId' in params &&
    isHex(params.from) &&
    isHex(params.to) &&
    isBigInt(params.tokenId)
  )
}

export const extractErc721SafeTransferFromParamValues = (data: Hex, methodId: Hex): Erc721SafeTransferFromParams => {
  const paramValues = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, data)
  try {
    const from = assertHexString(paramValues[0])
    const to = assertHexString(paramValues[1])
    const tokenId = assertBigInt(paramValues[2])
    return { from, to, tokenId }
  } catch (e) {
    return handleError({ data, methodId }, 'Invalid erc721SafeTransferFrom params', e)
  }
}

// type SafeTransferFromWithBytesParams = {
//   from: string
//   to: string
//   tokenId: string
//   data: string
// };
// export const isSafeTransferFromWithBytesParams = (params: unknown): params is SafeTransferFromWithBytesParams => {
//   return typeof params === 'object' &&
//     params !== null &&
//     'from' in params &&
//     'to' in params &&
//     'tokenId' in params &&
//     'data' in params &&
//     isString(params.from) &&
//     isString(params.to) &&
//     isString(params.tokenId) &&
//     isString(params.data);
// }
// export const extractSafeTransferFromBytesParamValues = (data: Hex, methodId: Hex): SafeTransferFromWithBytesParams => {
//   const paramValues = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, data)
//   try {
//     const from = assertHexString(paramValues[0]);
//     const to = assertHexString(paramValues[1]);
//     const tokenId = assertBigInt(paramValues[2]);
//     const data = assertString(paramValues[3]);
//     return { from, to, tokenId: tokenId.toString().toLowerCase(), data };
//   } catch (e) {
//     return handleError({ data, methodId }, 'Invalid sender, recipient or tokenId', e);
//   }
// }

type Erc1155SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: string
  amount: string
  data: Hex
}
export const isErc1155SafeTransferFromParams = (params: unknown): params is Erc1155SafeTransferFromParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'from' in params &&
    'to' in params &&
    'tokenId' in params &&
    'amount' in params &&
    'data' in params &&
    isHex(params.from) &&
    isHex(params.to) &&
    isString(params.tokenId) &&
    isString(params.amount) &&
    isString(params.data)
  )
}

export const extractErc1155SafeTransferFromParamValues = (data: Hex, methodId: Hex): Erc1155SafeTransferFromParams => {
  const paramValues = decodeAbiParameters(Erc1155SafeTransferFromAbiParameters, data)
  try {
    const from = assertHexString(paramValues[0])
    const to = assertHexString(paramValues[1])
    const tokenId = assertBigInt(paramValues[2])
    const amount = assertBigInt(paramValues[3])
    const data = assertHexString(paramValues[4])
    return { from, to, tokenId: tokenId.toString().toLowerCase(), amount: amount.toString().toLowerCase(), data }
  } catch (e) {
    return handleError({ data, methodId }, 'Invalid erc1155safeTransferParams', e)
  }
}

type SafeBatchTransferFromParams = {
  from: Hex
  to: Hex
  tokenIds: string[]
  amounts: string[]
  data: Hex
}
export const isSafeBatchTransferFromParams = (params: unknown): params is SafeBatchTransferFromParams => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'from' in params &&
    'to' in params &&
    'tokenIds' in params &&
    'amounts' in params &&
    'data' in params &&
    isHex(params.from) &&
    isHex(params.to) &&
    isArray(params.tokenIds) &&
    isArray(params.amounts) &&
    isHex(params.data)
  )
}
export const extractSafeBatchTransferFromParamValues = (data: Hex, methodId: Hex): SafeBatchTransferFromParams => {
  const paramValues = decodeAbiParameters(Erc1155SafeBatchTransferFromAbiParameters, data)
  try {
    const from = assertHexString(paramValues[0])
    const to = assertHexString(paramValues[1])
    const tokenIds = assertArray<bigint>(paramValues[2], 'bigint')
    const amounts = assertArray<bigint>(paramValues[3], 'bigint')
    const data = assertHexString(paramValues[4])
    const stringAmounts = amounts.map((amount) => amount.toString().toLowerCase())
    const stringTokenIds = tokenIds.map((tokenId) => tokenId.toString().toLowerCase())
    return { from, to, tokenIds: stringTokenIds, amounts: stringAmounts, data }
  } catch (e) {
    return handleError({ data, methodId }, 'Invalid safeBatchtransferParams', e)
  }
}

export const extractors = {
  [Erc20Methods.TRANSFER]: extractTransferParamValues,
  [AmbiguousMethods.TRANSFER_FROM]: extractTransferFromParamValues,
  [Erc721Methods.SAFE_TRANSFER_FROM]: extractErc721SafeTransferFromParamValues,
  [Erc721Methods.SAFE_TRANSFER_FROM_WITH_BYTES]: extractErc721SafeTransferFromParamValues,
  [Erc1155Methods.SAFE_TRANSFER_FROM]: extractErc1155SafeTransferFromParamValues,
  [Erc1155Methods.SAFE_TRANSFER_FROM_WITH_BYTES]: extractErc1155SafeTransferFromParamValues,
  [Erc1155Methods.SAFE_BATCH_TRANSFER_FROM]: extractSafeBatchTransferFromParamValues
}

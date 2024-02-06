import { Address, AssetType, Hex } from '@narval/authz-shared'
// eslint-disable-next-line no-restricted-imports
import { isAddress } from 'viem'
import { AssetTypeAndUnknown, Misc, Permit2Message, PermitMessage } from './domain'
import { SupportedMethodId } from './supported-methods'

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

export function isHexString(value: unknown): value is Hex {
  return isString(value) && value.startsWith('0x')
}

export const assertHexString = (value: unknown): Hex => {
  if (isHexString(value)) {
    return value
  }
  throw new Error('Value is not a hex string')
}

export const assertLowerHexString = (value: unknown): Hex => {
  return assertHexString(value).toLowerCase() as Hex
}

export function assertString(value: unknown): string {
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

export const isSupportedMethodId = (value: Hex): value is SupportedMethodId => {
  return Object.values(SupportedMethodId).includes(value as SupportedMethodId)
}

export const assertAddress = (value: unknown): Address => {
  if (!isString(value) || !isAddress(value)) {
    throw new Error('Value is not an address')
  }
  return value.toLowerCase() as Address
}

type AssertType = 'string' | 'bigint' | 'number' | 'boolean' | 'hex'

export const isAssetType = (value: unknown): value is AssetTypeAndUnknown => {
  const types: AssetTypeAndUnknown[] = Object.values(AssetType)
  types.push(Misc.UNKNOWN)

  return types.includes(value as AssetTypeAndUnknown)
}

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
      return value.map(assertLowerHexString) as T[]
    }
    default: {
      return value
    }
  }
}

export const isPermit = (message: Record<string, unknown>): message is PermitMessage => {
  if (
    typeof message === 'object' &&
    'owner' in message &&
    'value' in message &&
    'nonce' in message &&
    'deadline' in message &&
    'spender' in message
  ) {
    return true
  }
  return false
}

export const isPermit2 = (message: Record<string, unknown>): message is Permit2Message => {
  if (typeof message !== 'object' || message === null || !('spender' in message) || !('details' in message)) {
    return false
  }
  const { spender, details } = message as { spender: unknown; details: unknown }
  if (
    typeof details === 'object' &&
    details !== null &&
    'amount' in details &&
    'nonce' in details &&
    'expiration' in details &&
    'token' in details &&
    'owner' in details
  ) {
    const { amount, nonce, expiration, token, owner } = details as {
      amount: unknown
      nonce: unknown
      expiration: unknown
      token: unknown
      owner: unknown
    }
    if (
      typeof amount === 'string' &&
      amount.startsWith('0x') &&
      typeof nonce === 'number' &&
      typeof expiration === 'number' &&
      typeof spender === 'string' &&
      typeof token === 'string' &&
      typeof owner === 'string' &&
      isAddress(token) &&
      isAddress(spender) &&
      isAddress(owner)
    ) {
      return true
    }
  }
  return false
}

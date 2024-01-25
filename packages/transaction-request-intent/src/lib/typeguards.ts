import { AssetType as AssetTypeEnum, Hex } from '@narval/authz-shared'
import { AssetType, Misc } from './domain'
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

type AssertType = 'string' | 'bigint' | 'number' | 'boolean' | 'hex'

export const isAssetType = (value: unknown): value is AssetType => {
  const types: AssetType[] = Object.values(AssetTypeEnum)
  types.push(Misc.UNKNOWN)

  return types.includes(value as AssetType)
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

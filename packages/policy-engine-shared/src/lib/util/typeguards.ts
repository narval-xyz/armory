import { Address, Hex } from '../type/domain.type'

// eslint-disable-next-line no-restricted-imports
import { isAddress } from 'viem'

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isBigInt = (value: unknown): value is bigint => {
  return typeof value === 'bigint'
}

export const assertBigInt = (value: unknown): bigint | null => {
  if (isBigInt(value)) {
    return value
  }
  return null
}

export function isHexString(value: unknown): value is Hex {
  return isString(value) && value.startsWith('0x')
}

export const assertHexString = (value: unknown): Hex | null => {
  if (isHexString(value)) {
    return value
  }
  return null
}

export function assertString(value: unknown): string | null {
  if (isString(value)) {
    return value
  }
  return null
}

// Checks if a value is a number
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export const assertNumber = (value: unknown): number | null => {
  if (isNumber(value)) {
    return value
  }
  return null
}

// Checks if a value is a boolean
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export const assertBoolean = (value: unknown): boolean | null => {
  if (isBoolean(value)) {
    return value
  }
  return null
}

// Checks if a value is an array
export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value)
}

export const assertAddress = (value: unknown): Address | null => {
  if (!isString(value) || !isAddress(value)) {
    return null
  }
  return value.toLowerCase() as Address
}

type AssertType = 'string' | 'bigint' | 'number' | 'boolean' | 'hex'

export const assertArray = <T>(value: unknown, type: AssertType): T[] | null => {
  if (!Array.isArray(value)) {
    return null
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

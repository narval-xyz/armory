import { createHash } from 'crypto'
import { stringify } from './json.util'

const sort = (value: unknown): unknown => {
  if (typeof value !== 'object' || value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(sort)
  }

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: sort((value as Record<string, unknown>)[key])
      }
    }, {})
}

/**
 * Returns the hexadecimal of the given value SHA256 hash.
 *
 * Works with BigInt primitives.
 *
 * @param value an object
 * @returns object's hash
 */
export const hashRequest = (value: unknown): string => {
  return createHash('sha256')
    .update(stringify(sort(value)))
    .digest('hex')
}

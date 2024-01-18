import { createHash } from 'crypto'
import { stringify } from './json.util'

/**
 * Returns the hexadecimal of the given value SHA256 hash.
 *
 * Works with BigInt primitives.
 *
 * @param value an object
 * @returns object's hash
 */
export const hashRequest = (value: unknown): string => {
  return createHash('sha256').update(stringify(value)).digest('hex')
}

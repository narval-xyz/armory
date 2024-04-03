import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { toHex } from 'viem'
import { canonicalize } from './json.util'
import { Hex } from './types'

/**
 * Returns the hexadecimal of the given value SHA256 hash.
 *
 * Works with BigInt primitives & canonicalizes json objects
 *
 * @param value an object
 * @returns object's hash
 */
export const hash = (value: unknown): Hex => {
  return toHex(sha256Hash(canonicalize(value)))
}

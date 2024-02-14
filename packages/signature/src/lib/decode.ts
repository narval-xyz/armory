import { decodeJwt, decodeProtectedHeader } from 'jose'
import { JwtError } from './error'
import { isHeader, isPayload } from './typeguards'
import { Jwt, Payload } from './types'

/**
 * Decodes a JWT without verifying its signature.
 *
 * @param {string} rawToken - The JWT to decode.
 * @returns {Jwt} A promise that resolves with the decoded payload.
 * @throws {Error} If the payload does not match the expected structure.
 * @throws {Error} If the header does not match the expected structure.
 */
export function decode(rawToken: string): Jwt {
  try {
    const parts = rawToken.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT: The token must have three parts')
    }
    const header = decodeProtectedHeader(rawToken)
    const payload = decodeJwt<Payload>(rawToken)
    if (!isPayload(payload)) {
      throw new JwtError({ message: 'Invalid payload', context: { rawToken, payload } })
    }
    if (!isHeader(header)) {
      throw new JwtError({ message: 'Invalid header', context: { rawToken, header } })
    }
    return {
      header,
      payload
    }
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { rawToken, error } })
  }
}

import { decodeJwt } from 'jose'
import { JwtError } from './error'
import { isPayload } from './typeguards'
import { Payload } from './types'

/**
 * Decodes a JWT without verifying its signature.
 *
 * @param {string} rawToken - The JWT to decode.
 * @returns {Jwt} A promise that resolves with the decoded payload.
 * @throws {Error} If the payload does not match the expected structure.
 * @throws {Error} If the header does not match the expected structure.
 */
export function decode(rawToken: string): Payload {
  try {
    const payload = decodeJwt<Payload>(rawToken)

    if (!isPayload(payload)) {
      throw new JwtError({ message: 'Invalid payload', context: { rawToken, payload } })
    }
    return payload
  } catch (error) {
    console.log('error', error)
    throw new JwtError({ message: 'Malformed token', context: { rawToken, error } })
  }
}

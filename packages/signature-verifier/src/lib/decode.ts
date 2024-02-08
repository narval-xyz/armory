import { decodeJwt } from 'jose'
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
    const { payload, protectedHeader } = decodeJwt<Payload>(rawToken)

    if (!isPayload(payload)) {
      throw new JwtError({ message: 'Invalid payload', context: { rawToken, payload, protectedHeader } })
    }
    if (!isHeader(protectedHeader)) {
      throw new JwtError({ message: 'Invalid header', context: { rawToken, payload, protectedHeader } })
    }
    const jwt: Jwt = {
      header: {
        alg: protectedHeader.alg,
        kid: protectedHeader.kid
      },
      payload,
      signature: rawToken.split('.')[2]
    }
    return jwt
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { rawToken, error } })
  }
}

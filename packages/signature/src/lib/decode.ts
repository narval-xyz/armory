import { JwtError } from './error'
import { isHeader } from './typeguards'
import { Jwt } from './types'
import { base64UrlToBytes } from './utils'

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
    const [headerStr, payloadStr, jwtSig] = parts
    const header = JSON.parse(base64UrlToBytes(headerStr).toString('utf-8'))
    const payload = JSON.parse(base64UrlToBytes(payloadStr).toString('utf-8'))

    // TODO: Switch these to zod parsers
    // if (!isPayload(payload)) {
    //   throw new JwtError({ message: 'Invalid payload', context: { rawToken, payload } })
    // }
    if (!isHeader(header)) {
      throw new JwtError({ message: 'Invalid header', context: { rawToken, header } })
    }

    return {
      header,
      payload,
      signature: jwtSig
    }
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { rawToken, error } })
  }
}

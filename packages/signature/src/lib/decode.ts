import { JwtError } from './error'
import { Header, Payload } from './schemas'
import { type Jwsd, type Jwt } from './types'

import { base64UrlToBytes } from './utils'

/**
 * Decodes a JWT without verifying its signature.
 *
 * @param {string} rawToken - The JWT to decode.
 * @returns {Jwt} A promise that resolves with the decoded payload.
 * @throws {Error} If the payload does not match the expected structure.
 * @throws {Error} If the header does not match the expected structure.
 */
function decode(rawToken: string) {
  const parts = rawToken.split('.')
  if (parts.length !== 3) {
    throw new JwtError({ message: 'Invalid JWT: The token must have three parts', context: { rawToken } })
  }
  try {
    const [headerStr, payloadStr, jwtSig] = parts
    const headerDecoded = base64UrlToBytes(headerStr).toString('utf-8')
    const header = Header.parse(JSON.parse(headerDecoded))

    // Return the String representation of the payload because JWT and JWSD have different payload types
    const payloadDecoded = base64UrlToBytes(payloadStr).toString('utf-8')

    return {
      header,
      payload: payloadDecoded,
      signature: jwtSig
    }
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { rawToken, error } })
  }
}

export function decodeJwt(rawToken: string): Jwt {
  const decoded = decode(rawToken)
  if (decoded.header.typ.toLowerCase() !== 'jwt') {
    throw new JwtError({ message: 'Invalid header. Must be jwt.', context: { rawToken, decoded } })
  }

  const parsedPayload = Payload.parse(JSON.parse(decoded.payload))

  return {
    header: decoded.header,
    payload: parsedPayload,
    signature: decoded.signature
  }
}

/**
 * Decodes a JWSd without verifying its signature.
 *
 * @param {string} rawToken - The JWS to decode.
 * @returns {Jwsd} A promise that resolves with the decoded payload.
 * @throws {Error} If the payload does not match the expected structure.
 * @throws {Error} If the header does not match the expected structure.
 */
export function decodeJwsd(rawToken: string): Jwsd {
  const decoded = decode(rawToken)
  if (decoded.header.typ.toLowerCase() !== 'gnap-binding-jwsd') {
    throw new JwtError({ message: 'Invalid header type. Must be gnap-binding-jwsd.', context: { rawToken, decoded } })
  }

  return decoded
}

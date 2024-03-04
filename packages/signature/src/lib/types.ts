import { Hex } from 'viem'

export const KeyTypes = {
  EC: 'EC',
  RSA: 'RSA'
} as const

export type KeyTypes = (typeof KeyTypes)[keyof typeof KeyTypes]

export const Curves = {
  SECP256K1: 'secp256k1',
  P256: 'P-256'
} as const

export type Curves = (typeof Curves)[keyof typeof Curves]

export const Alg = {
  ES256K: 'ES256K', // secp256k1, an Ethereum EOA
  ES256: 'ES256', // secp256r1, ecdsa but not ethereum
  RS256: 'RS256'
} as const

export type Alg = (typeof Alg)[keyof typeof Alg]

/**
 * Defines the header of JWT.
 *
 * @param {Alg} alg - The algorithm used to sign the JWT. It contains ES256K which is not natively supported
 * by the jsonwebtoken package
 * @param {string} [kid] - The key ID to identify the signing key.
 */
export type Header = {
  alg: Alg // From the jsonwebtoken package, ensuring algorithm alignment
  kid: string // Key ID to identify the signing key
}

/**
 * Defines the payload of JWT.
 *
 * @param {string} requestHash - The hashed request.
 * @param {string} [iss] - The issuer of the JWT.
 * @param {Date} [iat] - The time the JWT was issued.
 * @param {Date} [exp] - The time the JWT expires.
 */
export type Payload = {
  requestHash: string
  pubKey: string
  iat: Date
  exp: Date
}

export type Jwt = {
  header: Header
  payload: Payload
  signature: string
}

/**
 * Defines the input required to generate a JWT signature for a request.
 *
 * @param {string | Hex} privateKey - The private key to sign the JWT with.
 * @param {string} kid - The key ID to identify the signing key.
 * @param {string} [exp] - The time the JWT expires.
 * @param {number} [iat] - The time the JWT was issued.
 * @param {Alg} algorithm - The algorithm to use for signing.
 * @param {unknown} request - The content of the request to be signed.
 */
export type SignatureInput = {
  privateKey: string | Hex
  exp?: Date
  iat?: Date
  kid: string
  algorithm: Alg
  request: unknown
}

/**
 * Defines the input required to verify a JWT.
 *
 * @param {string} jwt - The JWT to be verified.
 * @param {string} publicKey - The public key that corresponds to the private key used for signing.
 */
export type VerificationInput = {
  jwt: string
  publicKey: string
}

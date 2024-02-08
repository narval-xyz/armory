import { Alg, Request } from '@narval/authz-shared'

export type AlgorithmParameter = {
  kty: 'EC' | 'RSA'
  crv?: string
}

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
 * @param {number} [iat] - The time the JWT was issued.
 * @param {number} [exp] - The time the JWT expires.
 */
export type Payload = {
  requestHash: string
  pubKey: string
  iat: number
}

export type Jwt = {
  header: Header
  payload: Payload
  signature: string
}

/**
 * Defines the input required to generate a JWT signature for a request.
 *
 * @param {string} privateKey - The private key to sign the JWT with. Private key will be identified by the kid in the header if this is not provided.
 * @param {string} kid - The key ID to identify the signing key.
 * @param {Alg} algorithm - The algorithm to use for signing.
 * @param {Request} request - The content of the request to be signed.
 */
export type SignatureInput = {
  privateKey: string
  kid: string
  algorithm: Alg
  request: Request
}

/**
 * Defines the input required to verify a JWT.
 *
 * @param {string} jwt - The JWT to be verified.
 * @param {Request} request - The content of the request to be verified.
 * @param {string} publicKey - The public key that corresponds to the private key used for signing.
 */
export type VerificationInput = {
  rawToken: string
  request: Request
  publicKey: string
  algorithm: Alg
  kid: string
}

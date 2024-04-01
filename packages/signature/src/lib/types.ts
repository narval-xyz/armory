import { z } from 'zod'
import {
  Header,
  Jwsd,
  JwsdHeader,
  Jwt,
  Payload,
  ellipticKeySchema,
  jwkBaseSchema,
  jwkEoaSchema,
  jwkSchema,
  p256KeySchema,
  p256PrivateKeySchema,
  p256PublicKeySchema,
  privateKeySchema,
  publicKeySchema,
  rsaPrivateKeySchema,
  rsaPublicKeySchema,
  secp256k1KeySchema,
  secp256k1PrivateKeySchema,
  secp256k1PublicKeySchema
} from './schemas'

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

export const SigningAlg = {
  ES256K: 'ES256K',
  EIP191: 'EIP191', // ecdsa on secp256k1 with keccak256 & data prefixed w/ \x19Ethereum Signed Message:\n + len(message)
  ES256: 'ES256',
  RS256: 'RS256'
} as const

export type SigningAlg = (typeof SigningAlg)[keyof typeof SigningAlg]

export const Use = {
  SIG: 'sig',
  ENC: 'enc'
} as const

export type Use = (typeof Use)[keyof typeof Use]

export type Secp256k1PrivateKey = z.infer<typeof secp256k1PrivateKeySchema>
export type P256PrivateKey = z.infer<typeof p256PrivateKeySchema>
export type P256PublicKey = z.infer<typeof p256PublicKeySchema>
export type P256Key = z.infer<typeof p256KeySchema>
export type RsaPrivateKey = z.infer<typeof rsaPrivateKeySchema>
export type RsaPublicKey = z.infer<typeof rsaPublicKeySchema>
export type RsaKey = RsaPrivateKey | RsaPublicKey
export type EoaPublicKey = z.infer<typeof jwkEoaSchema>
export type Secp256k1PublicKey = z.infer<typeof secp256k1PublicKeySchema>
export type Secp256k1Key = z.infer<typeof secp256k1KeySchema>
export type EllipticKey = z.infer<typeof ellipticKeySchema>
export type PublicKey = z.infer<typeof publicKeySchema>
export type PrivateKey = z.infer<typeof privateKeySchema>
export type PartialJwk = z.infer<typeof jwkBaseSchema>
export type Jwk = z.infer<typeof jwkSchema>

export type Hex = `0x${string}` // DOMAIN

export type Header = z.infer<typeof Header>
export type JwsdHeader = z.infer<typeof JwsdHeader>
export type Payload = z.infer<typeof Payload>

export type Jwt = z.infer<typeof Jwt>

export type Jwsd = z.infer<typeof Jwsd>

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
  exp?: number
  iat?: number
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

export type EcdsaSignature = {
  r: Hex
  s: Hex
  v: bigint
}

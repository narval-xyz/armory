import { z } from 'zod'
import { addressSchema } from './address.schema'
import { Alg, Curves, KeyTypes, Use } from './types'

// Base JWK Schema
export const jwkBaseSchema = z.object({
  kty: z.nativeEnum(KeyTypes).optional(),
  alg: z.nativeEnum(Alg),
  use: z.nativeEnum(Use).optional(),
  kid: z.string(),
  addr: z.string().optional()
})

export const jwkEoaSchema = z.object({
  kty: z.literal(KeyTypes.EC),
  crv: z.enum([Curves.SECP256K1]),
  alg: z.literal(Alg.ES256K),
  use: z.nativeEnum(Use).optional(),
  kid: z.string(),
  addr: addressSchema
})

// EdDSA Base and PublicKey Schema
export const ed25519PublicKeySchema = jwkBaseSchema.extend({
  kty: z.literal(KeyTypes.OKP),
  crv: z.literal(Curves.ED25519),
  alg: z.literal(Alg.EDDSA),
  x: z.string() // Ed25519 public key, no y coordinate
})

// EdDSA Private Key Schema
export const ed25519PrivateKeySchema = ed25519PublicKeySchema.extend({
  d: z.string(), // Ed25519 private key
  x: z.string().optional()
})

// EC Base Schema
export const ecBaseSchema = jwkBaseSchema.extend({
  kty: z.literal(KeyTypes.EC),
  crv: z.enum([Curves.SECP256K1, Curves.P256]),
  x: z.string(),
  y: z.string()
})

// RSA Base Schema
export const rsaBaseSchema = jwkBaseSchema.extend({
  kty: z.literal(KeyTypes.RSA),
  alg: z.literal(Alg.RS256),
  n: z.string(),
  e: z.string()
})

// Specific Schemas for Public Keys
export const secp256k1PublicKeySchema = ecBaseSchema.extend({
  crv: z.literal(Curves.SECP256K1),
  alg: z.literal(Alg.ES256K)
})

export const p256PublicKeySchema = ecBaseSchema.extend({
  crv: z.literal(Curves.P256),
  alg: z.literal(Alg.ES256)
})

export const rsaPublicKeySchema = rsaBaseSchema

// Specific Schemas for Private Keys
export const secp256k1PrivateKeySchema = secp256k1PublicKeySchema.extend({
  d: z.string(),
  x: z.string().optional(),
  y: z.string().optional()
})

export const p256PrivateKeySchema = p256PublicKeySchema.extend({
  d: z.string(),
  x: z.string().optional(),
  y: z.string().optional()
})

export const rsaPrivateKeySchema = rsaPublicKeySchema.extend({
  d: z.string(),
  p: z.string().optional(),
  q: z.string().optional(),
  dp: z.string().optional(),
  dq: z.string().optional(),
  qi: z.string().optional()
})

export const publicKeySchema = z.union([
  secp256k1PublicKeySchema,
  p256PublicKeySchema,
  rsaPublicKeySchema,
  jwkEoaSchema,
  ed25519PublicKeySchema
])

export const privateKeySchema = z.union([
  secp256k1PrivateKeySchema,
  p256PrivateKeySchema,
  rsaPrivateKeySchema,
  ed25519PrivateKeySchema
])

export const ed25519KeySchema = z.union([ed25519PublicKeySchema, ed25519PrivateKeySchema])

export const secp256k1KeySchema = z.union([secp256k1PublicKeySchema, secp256k1PrivateKeySchema])

export const p256KeySchema = z.union([p256PublicKeySchema, p256PrivateKeySchema])

export const ellipticKeySchema = z.union([secp256k1KeySchema, p256KeySchema])

const dynamicKeySchema = z.object({}).catchall(z.unknown())

export const jwkSchema = dynamicKeySchema.extend({
  kty: z.nativeEnum(KeyTypes).optional().describe('Key Type (e.g. RSA or EC'),
  crv: z.nativeEnum(Curves).optional().describe('Curve name'),
  alg: z.nativeEnum(Alg).optional().describe('Algorithm'),
  use: z.nativeEnum(Use).optional().describe('Public Key Use'),
  kid: z.string().optional().describe('Unique key ID'),
  n: z.string().optional().describe('(RSA) Key modulus'),
  e: z.string().optional().describe('(RSA) Key exponent'),
  x: z.string().optional().describe('(EC) X Coordinate'),
  y: z.string().optional().describe('(EC) Y Coordinate'),
  d: z.string().optional().describe('(EC) Private Key')
})

/**
 * Defines the header of JWT.
 *
 * @param {Alg} alg - The algorithm used to sign the JWT. It contains ES256K which is not natively supported
 * by the jsonwebtoken package
 * @param {string} [kid] - The key ID to identify the signing key.
 */

export const Header = z.intersection(
  z.record(z.string(), z.unknown()),
  z.object({
    alg: z.union([
      z.literal('ES256K'),
      z.literal('ES256'),
      z.literal('RS256'),
      z.literal('EIP191'),
      z.literal('EDDSA')
    ]),
    kid: z.string().min(1).describe('The key ID to identify the signing key.'),
    typ: z
      .union([z.literal('JWT'), z.literal('gnap-binding-jwsd')])
      .describe(
        'The type of the token. It is set to JWT by default. For GNAP JWSD, it is set to gnap-binding-jwsd https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-19.html#name-detached-jws.'
      ),
    htm: z.string().optional().describe('HTTP Method'),
    uri: z
      .string()
      .optional()
      .describe(
        'The HTTP URI used for this request. This value MUST be an absolute URI, including all path and query components and no fragment component.'
      ),
    created: z.number().optional().describe('The time the request was created.'),
    ath: z
      .string()
      .optional()
      .describe(
        "The hash of the access token. The value MUST be the result of Base64url encoding (with no padding) the SHA-256 digest of the ASCII encoding of the associated access token's value."
      ),
    crit: z.array(z.string().min(1)).optional().describe('The list of headers that are critical for the request')
  })
)

export const JwsdHeader = z.object({
  alg: z.union([z.literal('ES256K'), z.literal('ES256'), z.literal('RS256'), z.literal('EIP191')]),
  kid: z.string().min(1).describe('The key ID to identify the signing key.'),
  typ: z
    .literal('gnap-binding-jwsd')
    .describe('https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-19.html#name-detached-jws.'),
  htm: z.string().describe('HTTP Method'),
  uri: z
    .string()
    .describe(
      'The HTTP URI used for this request. This value MUST be an absolute URI, including all path and query components and no fragment component.'
    ),
  created: z.number().describe('The time the request was created.'),
  ath: z
    .string()
    .optional()
    .describe(
      "The hash of the access token. The value MUST be the result of Base64url encoding (with no padding) the SHA-256 digest of the ASCII encoding of the associated access token's value."
    )
})

/**
 * Defines the payload of JWT.
 *
 * @param {string} requestHash - The hashed request.
 * @param {string} [iss] - The issuer of the JWT.
 * @param {number} [iat] - The time the JWT was issued.
 * @param {number} [exp] - The time the JWT expires.
 * @param {string} sub - The subject of the JWT.
 * @param {string} [aud] - The audience of the JWT.
 * @param {string[]} [hashWildcard] - A list of paths that were not hashed in the request.
 * @param {string} [jti] - The JWT ID.
 * @param {Jwk} cnf - The client-bound key.
 *
 */
export const Payload = z.object({
  sub: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
  iss: z.string().optional(),
  aud: z.string().optional(),
  jti: z.string().optional(),
  cnf: publicKeySchema.optional(),
  requestHash: z.string().optional(),
  hashWildcard: z.array(z.string()).optional(),
  data: z.string().optional()
})

export const Jwt = z.object({
  header: Header,
  payload: Payload,
  signature: z.string()
})

export const Jwsd = z.object({
  header: Header,
  payload: z.string(),
  signature: z.string()
})

export const SignJwtOptions = z.object({
  alg: z.nativeEnum(Alg).optional(),
  kid: z.string().optional()
})
export const SignJwtInput = z.object({
  payload: Payload
})

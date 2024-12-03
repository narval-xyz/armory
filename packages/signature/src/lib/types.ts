import { z } from 'zod'
import { addressSchema } from './address.schema'

export const KeyTypes = {
  EC: 'EC',
  RSA: 'RSA',
  OKP: 'OKP' // Octet Key Pair for EdDSA
} as const

export type KeyTypes = (typeof KeyTypes)[keyof typeof KeyTypes]

export const Curves = {
  SECP256K1: 'secp256k1',
  P256: 'P-256',
  ED25519: 'Ed25519'
} as const

export type Curves = (typeof Curves)[keyof typeof Curves]

export const Alg = {
  ES256K: 'ES256K', // secp256k1, an Ethereum EOA
  ES256: 'ES256', // secp256r1, ecdsa but not ethereum
  RS256: 'RS256',
  EDDSA: 'EDDSA'
} as const

export type Alg = (typeof Alg)[keyof typeof Alg]

export const SigningAlg = {
  ES256K: 'ES256K',
  EIP191: 'EIP191', // ecdsa on secp256k1 with keccak256 & data prefixed w/ \x19Ethereum Signed Message:\n + len(message)
  ES256: 'ES256',
  RS256: 'RS256',
  ED25519: 'EDDSA'
} as const

export type SigningAlg = (typeof SigningAlg)[keyof typeof SigningAlg]

export const Use = {
  SIG: 'sig',
  ENC: 'enc'
} as const

export type Use = (typeof Use)[keyof typeof Use]

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

// EC Base Schema
export const ecBaseSchema = jwkBaseSchema.extend({
  kty: z.literal(KeyTypes.EC),
  crv: z.enum([Curves.SECP256K1, Curves.P256]),
  x: z.string(),
  y: z.string()
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

export const secp256k1KeySchema = z.union([secp256k1PublicKeySchema, secp256k1PrivateKeySchema])

export const ed25519KeySchema = z.union([ed25519PublicKeySchema, ed25519PrivateKeySchema])

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
export type Header = z.infer<typeof Header>

export const JwsdHeader = z.object({
  alg: z.union([z.literal('ES256K'), z.literal('ES256'), z.literal('RS256'), z.literal('EIP191'), z.literal('EDDSA')]),
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
export type JwsdHeader = z.infer<typeof JwsdHeader>

export const PayloadAccessSchema = z.object({
  resource: z.string(),
  permissions: z.array(z.string())
})
export type PayloadAccessSchema = z.infer<typeof PayloadAccessSchema>

/**
 * Defines the payload of JWT.
 *
 * @param {string} requestHash - The hashed request.
 * @param {string} [iss] - The issuer of the JWT.
 * @param {number} [iat] - The time the JWT was issued.
 * @param {number} [exp] - The time the JWT expires.
 * @param {number} [nbf] - The time the JWT becomes valid.
 * @param {string} sub - The subject of the JWT.
 * @param {string | string[]} [aud] - The audience of the JWT.
 * @param {string} [azp] - The authorized party of the JWT. Typically a client-id.
 * @param {string} [jti] - The JWT ID.
 * @param {string[]} [hashWildcard] - The paths to be ignored in the request before comparison with payload.hash.
 * @param {Jwk} cnf - The client-bound key.
 *
 */
export const Payload = z.intersection(
  z.record(z.string(), z.unknown()),
  z.object({
    sub: z.string().optional(),
    iat: z.number().optional(),
    exp: z.number().optional(),
    nbf: z.number().optional(),
    iss: z.string().optional(),
    aud: z.union([z.string(), z.array(z.string())]).optional(),
    jti: z.string().optional(),
    azp: z.string().optional(),
    cnf: publicKeySchema.optional(),
    requestHash: z.string().optional(),
    hashWildcard: z.array(z.string()).optional(),
    data: z.string().optional(),
    access: z.array(PayloadAccessSchema).optional()
  })
)
export type Payload = z.infer<typeof Payload>

export const Jwt = z.object({
  header: Header,
  payload: Payload,
  signature: z.string()
})
export type Jwt = z.infer<typeof Jwt>

export const Jwsd = z.object({
  header: Header,
  payload: z.string(),
  signature: z.string()
})
export type Jwsd = z.infer<typeof Jwsd>

export type JwtVerifyOptions = {
  /** Expected JWT "aud" (Audience) Claim value(s). */
  audience?: string | string[]

  /** Expected JWT "iss" (Issuer) Claim value(s). */
  issuer?: string | string[]

  /**
   * Time to expiration (in seconds) from the JWT "iat" (Issued At) Claim value.
   */
  maxTokenAge?: number

  /** Expected JWT "sub" (Subject) Claim value. */
  subject?: string

  /** Expected JWT "azp" (Authorized Party) Claim value. */
  authorizedParty?: string

  /** Expected JWT "typ" (Type) Header Parameter value. */
  typ?: string

  /** Date to use for "now", in seconds since epoch, defaults to Math.floor(Date.now() / 1000) */
  now?: number

  /**
   * Array of required Claims that much exist in the payload
   * Defaults to require any claims that correspond to the Verify options set (e.g. if Issuer option is set, then the iss claim must be too)
   */
  requiredClaims?: string[]

  /**
   * Array of critical headers that are recognized
   */
  crit?: string[]

  /**
   * Hash of the request body, or the body itself which will be hashed then compared
   */
  requestHash?: Hex | object

  /**
   * Hash of the data, or the data itself which will be hashed then compared
   */
  data?: Hex | object

  /**
   * Pathes that can be wildcarded in the request before hashing
   * If enabled, incoming request will be hashed without the field found both here and in payload.hashWildcard before comparison with payload.requestHash
   */
  allowWildcard?: string[]

  access?: { resource: string; permissions?: string[] }[]
}

export type JwsdVerifyOptions = {
  requestBody: object
  accessToken: string
  uri: string
  htm: string
  maxTokenAge: number
}

export type Secp256k1PrivateKey = z.infer<typeof secp256k1PrivateKeySchema>
export type P256PrivateKey = z.infer<typeof p256PrivateKeySchema>
export type P256PublicKey = z.infer<typeof p256PublicKeySchema>
export type Ed25519PublicKey = z.infer<typeof ed25519PublicKeySchema>
export type Ed25519PrivateKey = z.infer<typeof ed25519PrivateKeySchema>
export type Ed25519Key = z.infer<typeof ed25519KeySchema>
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

import { z } from 'zod'
import { addressSchema } from './address.schema'
import { Alg, Curves, KeyTypes, Use } from './types'

// Base JWK Schema
export const jwkBaseSchema = z.object({
  kty: z.nativeEnum(KeyTypes),
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
  d: z.string()
})

export const p256PrivateKeySchema = p256PublicKeySchema.extend({
  d: z.string()
})

export const rsaPrivateKeySchema = rsaPublicKeySchema.extend({
  d: z.string()
})

export const publicKeySchema = z.union([
  secp256k1PublicKeySchema,
  p256PublicKeySchema,
  rsaPublicKeySchema,
  jwkEoaSchema
])

export const privateKeySchema = z.union([secp256k1PrivateKeySchema, p256PrivateKeySchema, rsaPrivateKeySchema])

export const secp256k1KeySchema = z.union([secp256k1PublicKeySchema, secp256k1PrivateKeySchema])

export const jwkSchema = z.union([publicKeySchema, privateKeySchema])

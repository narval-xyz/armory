import { z } from 'zod'
import { entitiesSchema } from './entity.schema'

export const jsonWebKeySchema = z.object({
  kty: z.enum(['EC', 'RSA']).describe('Key Type (e.g. RSA or EC'),
  crv: z.enum(['P-256', 'secp256k1']).optional().describe('Curve name'),
  kid: z.string().describe('Unique key ID'),
  alg: z.string().describe('Algorithm'),
  use: z.enum(['sig', 'enc']).optional().describe('Public Key Use'),
  n: z.string().optional().describe('(RSA) Key modulus'),
  e: z.string().optional().describe('(RSA) Key exponent'),
  x: z.string().optional().describe('(EC) X Coordinate'),
  y: z.string().optional().describe('(EC) Y Coordinate'),
  d: z.string().optional().describe('(EC) Private Key')
})

export const dataStoreProtocolSchema = z.enum(['file'])

export const dataStoreConfigurationSchema = z.object({
  dataUrl: z.string(),
  signatureUrl: z.string(),
  keys: z.array(jsonWebKeySchema)
})

export const entityDataSchema = z
  .object({
    entity: z.object({
      data: entitiesSchema
    })
  })
  .describe('Entity data')

export const entitySignatureSchema = z
  .object({
    entity: z.object({
      signature: z.string()
    })
  })
  .describe('Entity data signature')

export const entityJsonWebKeySetSchema = z
  .object({
    entity: z.object({
      keys: z.array(jsonWebKeySchema)
    })
  })
  .describe('Entity JWKS')

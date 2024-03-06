import { z } from 'zod'
import { entitiesSchema } from './entity.schema'
import { policySchema } from './policy.schema'

export const jsonWebKeySchema = z.object({
  kty: z.enum(['EC', 'RSA']).describe('Key Type (e.g. RSA or EC'),
  crv: z.enum(['P-256', 'secp256k1']).optional().describe('Curve name'),
  kid: z.string().describe('Unique key ID'),
  alg: z.enum(['ES256K', 'ES256', 'RS256']).describe('Algorithm'),
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

export const dataStoreSchema = z.object({
  entity: dataStoreConfigurationSchema,
  policy: dataStoreConfigurationSchema
})

export const entityDataSchema = z.object({
  entity: z.object({
    data: entitiesSchema
  })
})

export const entitySignatureSchema = z.object({
  entity: z.object({
    signature: z.string()
  })
})

export const entityJsonWebKeysSchema = z.object({
  entity: z.object({
    keys: z.array(jsonWebKeySchema)
  })
})

export const policyDataSchema = z.object({
  policy: z.object({
    data: z.array(policySchema)
  })
})

export const policySignatureSchema = z.object({
  policy: z.object({
    signature: z.string()
  })
})

export const policyJsonWebKeysSchema = z.object({
  policy: z.object({
    keys: z.array(jsonWebKeySchema)
  })
})

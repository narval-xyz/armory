import { z } from 'zod'
import { entitiesSchema } from './entity.schema'

export const jsonWebKeySetSchema = z.object({
  kty: z.string().describe('Key Type (e.g. RSA or EC'),
  use: z.string(),
  kid: z.string().describe('Arbitrary key ID'),
  alg: z.string().describe('Algorithm'),
  n: z.string().describe('Key modulus'),
  e: z.string().describe('Key exponent')
})

export const dataStoreProtocolSchema = z.enum(['file'])

export const dataStoreConfigurationSchema = z.object({
  dataUrl: z.string(),
  signatureUrl: z.string(),
  keys: z.array(jsonWebKeySetSchema)
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

export const entityJsonWebKeySetSchema = z.object({
  entity: z.object({
    keys: z.array(jsonWebKeySetSchema)
  })
})

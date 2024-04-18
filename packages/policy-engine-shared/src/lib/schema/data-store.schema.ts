import { jwkSchema } from '@narval/signature'
import { z } from 'zod'
import { UrlType } from '../type/data-store.type'
import { entitiesSchema } from './entity.schema'
import { policySchema } from './policy.schema'

export const urlConfigurationSchema = z.object({
  type: z.nativeEnum(UrlType),
  url: z.string().min(1),
  headers: z.record(z.string()).optional()
})

export const dataStoreConfigurationSchema = z.object({
  data: urlConfigurationSchema,
  signature: urlConfigurationSchema,
  keys: z.array(jwkSchema)
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
    signature: z.string().min(1)
  })
})

export const entityJsonWebKeysSchema = z.object({
  entity: z.object({
    keys: z.array(jwkSchema)
  })
})

export const entityStoreSchema = z.object({
  data: entitiesSchema,
  signature: z.string().min(1)
})

export const policyDataSchema = z.object({
  policy: z.object({
    data: z.array(policySchema)
  })
})

export const policySignatureSchema = z.object({
  policy: z.object({
    signature: z.string().min(1)
  })
})

export const policyJsonWebKeysSchema = z.object({
  policy: z.object({
    keys: z.array(jwkSchema)
  })
})

export const policyStoreSchema = z.object({
  data: z.array(policySchema),
  signature: z.string().min(1)
})

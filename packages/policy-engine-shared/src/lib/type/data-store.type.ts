import { jwkSchema } from '@narval/signature'
import { z } from 'zod'
import { entitiesSchema } from '../schema/entity.schema'
import { policySchema } from '../schema/policy.schema'

export const SourceType = {
  HTTP: 'http',
  HTTPS: 'https',
  FILE: 'file'
} as const

export type SourceType = (typeof SourceType)[keyof typeof SourceType]

export const FileSource = z.object({
  type: z.literal(SourceType.FILE),
  url: z.string()
})

export const HttpSource = z.object({
  type: z.literal(SourceType.HTTP),
  url: z.string(),
  headers: z.record(z.string()).optional()
})

export const Source = z.discriminatedUnion('type', [FileSource, HttpSource])

export const DataStoreConfiguration = z.object({
  data: Source,
  signature: Source,
  keys: z.array(jwkSchema)
})

export const DataStore = z.object({
  entity: DataStoreConfiguration,
  policy: DataStoreConfiguration
})

export const EntityData = z.object({
  entity: z.object({
    data: entitiesSchema
  })
})

export const EntitySignature = z.object({
  entity: z.object({
    signature: z.string().min(1)
  })
})

export const EntityJsonWebKeys = z.object({
  entity: z.object({
    keys: z.array(jwkSchema)
  })
})

export const EntityStore = z.object({
  data: entitiesSchema,
  signature: z.string().min(1)
})

export const PolicyData = z.object({
  policy: z.object({
    data: z.array(policySchema)
  })
})

export const PolicySignature = z.object({
  policy: z.object({
    signature: z.string().min(1)
  })
})

export const PolicyJsonWebKeys = z.object({
  policy: z.object({
    keys: z.array(jwkSchema)
  })
})

export const PolicyStore = z.object({
  data: z.array(policySchema),
  signature: z.string().min(1)
})

export type Source = z.infer<typeof Source>
export type FileSource = z.infer<typeof FileSource>
export type HttpSource = z.infer<typeof HttpSource>
export type DataStoreConfiguration = z.infer<typeof DataStoreConfiguration>
export type DataStore = z.infer<typeof DataStore>
export type EntityData = z.infer<typeof EntityData>
export type EntitySignature = z.infer<typeof EntitySignature>
export type EntityJsonWebKeySet = z.infer<typeof EntityJsonWebKeys>
export type EntityStore = z.infer<typeof EntityStore>
export type PolicyData = z.infer<typeof PolicyData>
export type PolicySignature = z.infer<typeof PolicySignature>
export type PolicyJsonWebKeySet = z.infer<typeof PolicyJsonWebKeys>
export type PolicyStore = z.infer<typeof PolicyStore>

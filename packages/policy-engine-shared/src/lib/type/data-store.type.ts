import { jwkSchema, publicKeySchema } from '@narval/signature'
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
export type FileSource = z.infer<typeof FileSource>

export const HttpSource = z.object({
  type: z.literal(SourceType.HTTP),
  url: z.string(),
  headers: z.record(z.string()).optional()
})
export type HttpSource = z.infer<typeof HttpSource>

export const Source = z.discriminatedUnion('type', [FileSource, HttpSource])
export type Source = z.infer<typeof Source>

export const DataStoreConfiguration = z.object({
  data: Source,
  signature: Source,
  // NOTE: Limit the maximum size of the keys because the client creation in
  // the AS takes the first key and saves it in the database. If the maximum
  // amount changes, we must ensure the AS takes it into consideration.
  // See
  // - The `save` method in the apps/armory/src/client/core/service/client.service.ts
  keys: z.array(publicKeySchema).min(1).max(1)
})
export type DataStoreConfiguration = z.infer<typeof DataStoreConfiguration>

export const DataStore = z.object({
  entity: DataStoreConfiguration,
  policy: DataStoreConfiguration
})
export type DataStore = z.infer<typeof DataStore>

export const EntityData = z.object({
  entity: z.object({
    data: entitiesSchema
  })
})
export type EntityData = z.infer<typeof EntityData>

export const EntitySignature = z.object({
  entity: z.object({
    signature: z.string().min(1)
  })
})
export type EntitySignature = z.infer<typeof EntitySignature>

export const EntityJsonWebKeys = z.object({
  entity: z.object({
    keys: z.array(jwkSchema)
  })
})
export type EntityJsonWebKeySet = z.infer<typeof EntityJsonWebKeys>

export const EntityStore = z.object({
  data: entitiesSchema,
  signature: z.string().min(1)
})
export type EntityStore = z.infer<typeof EntityStore>

export const PolicyData = z.object({
  policy: z.object({
    data: z.array(policySchema)
  })
})
export type PolicyData = z.infer<typeof PolicyData>

export const PolicySignature = z.object({
  policy: z.object({
    signature: z.string().min(1)
  })
})
export type PolicySignature = z.infer<typeof PolicySignature>

export const PolicyJsonWebKeys = z.object({
  policy: z.object({
    keys: z.array(jwkSchema)
  })
})
export type PolicyJsonWebKeySet = z.infer<typeof PolicyJsonWebKeys>

export const PolicyStore = z.object({
  data: z.array(policySchema),
  signature: z.string().min(1)
})
export type PolicyStore = z.infer<typeof PolicyStore>

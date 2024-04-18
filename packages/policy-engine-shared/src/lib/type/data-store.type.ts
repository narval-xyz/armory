import { z } from 'zod'
import {
  dataStoreConfigurationSchema,
  entityDataSchema,
  entityJsonWebKeysSchema,
  entitySignatureSchema,
  entityStoreSchema,
  policyDataSchema,
  policyJsonWebKeysSchema,
  policySignatureSchema,
  policyStoreSchema,
  urlConfigurationSchema
} from '../schema/data-store.schema'

export const UrlType = {
  HTTP: 'http',
  HTTPS: 'https',
  FILE: 'file'
} as const

export type UrlType = (typeof UrlType)[keyof typeof UrlType]

export type UrlConfiguration = z.infer<typeof urlConfigurationSchema>
export type DataStoreConfiguration = z.infer<typeof dataStoreConfigurationSchema>

export type EntityData = z.infer<typeof entityDataSchema>
export type EntitySignature = z.infer<typeof entitySignatureSchema>
export type EntityJsonWebKeySet = z.infer<typeof entityJsonWebKeysSchema>
export type EntityStore = z.infer<typeof entityStoreSchema>

export type PolicyData = z.infer<typeof policyDataSchema>
export type PolicySignature = z.infer<typeof policySignatureSchema>
export type PolicyJsonWebKeySet = z.infer<typeof policyJsonWebKeysSchema>
export type PolicyStore = z.infer<typeof policyStoreSchema>

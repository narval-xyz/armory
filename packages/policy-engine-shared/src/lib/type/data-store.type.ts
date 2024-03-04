import { z } from 'zod'
import {
  dataStoreConfigurationSchema,
  dataStoreProtocolSchema,
  entityDataSchema,
  entityJsonWebKeySetSchema,
  entitySignatureSchema,
  jsonWebKeySetSchema
} from '../schema/data-store.schema'

export type JsonWebKeySet = z.infer<typeof jsonWebKeySetSchema>

export type DataStoreProtocol = z.infer<typeof dataStoreProtocolSchema>
export const DataStoreProtocol = dataStoreProtocolSchema.Enum

export type DataStoreConfiguration = z.infer<typeof dataStoreConfigurationSchema>

export type EntityData = z.infer<typeof entityDataSchema>

export type EntitySignature = z.infer<typeof entitySignatureSchema>

export type EntityJsonWebKeySet = z.infer<typeof entityJsonWebKeySetSchema>

import { z } from 'zod'
import {
  dataStoreConfigurationSchema,
  dataStoreProtocolSchema,
  entityDataSchema,
  entityJsonWebKeysSchema,
  entitySignatureSchema,
  jsonWebKeySchema,
  policyDataSchema,
  policyJsonWebKeysSchema,
  policySignatureSchema
} from '../schema/data-store.schema'

export type JsonWebKey = z.infer<typeof jsonWebKeySchema>

export type DataStoreProtocol = z.infer<typeof dataStoreProtocolSchema>
export const DataStoreProtocol = dataStoreProtocolSchema.Enum

export type DataStoreConfiguration = z.infer<typeof dataStoreConfigurationSchema>

export type EntityData = z.infer<typeof entityDataSchema>
export type EntitySignature = z.infer<typeof entitySignatureSchema>
export type EntityJsonWebKeySet = z.infer<typeof entityJsonWebKeysSchema>

export type PolicyData = z.infer<typeof policyDataSchema>
export type PolicySignature = z.infer<typeof policySignatureSchema>
export type PolicyJsonWebKeySet = z.infer<typeof policyJsonWebKeysSchema>

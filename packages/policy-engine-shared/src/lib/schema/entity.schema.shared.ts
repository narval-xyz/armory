import { z } from 'zod'
import { entitiesV2Schema } from './entity.schema.v2'
import { entitiesV1Schema } from './entity.schema.v1'

export const entitiesSchema = z.discriminatedUnion('version', [entitiesV1Schema, entitiesV2Schema])

export const EntityVersion = {
  '1': '1',
  '2': '2'
}
export type EntityVersion = keyof typeof EntityVersion;

const schemaMap = {
  '1': entitiesV1Schema,
  '2': entitiesV2Schema
} as const;

export const getEntitySchema = (version?: EntityVersion) => version ? schemaMap[version] : entitiesV1Schema;

export type EntitiesV<Version extends EntityVersion> = z.infer<(typeof schemaMap)[Version]>

export type Entities = z.infer<typeof entitiesSchema>

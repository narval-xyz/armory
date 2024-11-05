import { EntityVersion, entitiesV1Schema, entitiesV2Schema } from '../schema/entity.schema'
import { Entities, EntitiesV } from '../type/entity.type'

export type ValidationIssue = {
  code: string
  message: string
}

export type Validation = { success: true } | { success: false; issues: ValidationIssue[] }

export type Validator<Version extends EntityVersion> = (entities: EntitiesV<Version>) => ValidationIssue[]

export type ValidationOption<Version extends EntityVersion> = {
  version?: Validator<Version>[]
}

export const isV1 = (entities: Partial<Entities>): entities is Partial<EntitiesV<'1'>> =>
  entitiesV1Schema.safeParse(entities).success || 'accountGroups' in entities || 'userGroups' in entities
export const isV2 = (entities: Partial<Entities>): entities is Partial<EntitiesV<'2'>> =>
  entitiesV2Schema.safeParse(entities).success || 'groups' in entities

import { EntityVersion, Entities, EntitiesV } from '../schema/entity.schema.shared'
import { entitiesV1Schema } from '../schema/entity.schema.v1'

export type ValidationIssue = {
  code: string
  message: string
}

export type Validation = { success: true } | { success: false; issues: ValidationIssue[] }

export type Validator<Version extends EntityVersion> = (entities: EntitiesV<Version>) => ValidationIssue[]

export type RequiredValidators = Required<{
  [V in EntityVersion]: Validator<V>[]
}>

export type ValidationOption<Version extends EntityVersion> = {
  validators?: Validator<Version>[]
}

export const isV1 = (entities: Partial<Entities>): entities is Partial<EntitiesV<'1'>> =>
  entitiesV1Schema.safeParse(entities).success || 'accountGroups' in entities || 'userGroups' in entities

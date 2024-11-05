import { z } from 'zod'
import { entitiesV1Schema } from './entity.schema.v1'

export const groupEntitySchema = z.object({
  id: z.string()
})

export const entitiesV2Schema = entitiesV1Schema
  .omit({
    accountGroups: true,
    userGroups: true,
  })
  .extend({
    version: z.literal('2'),
    groups: z.array(groupEntitySchema),
  })

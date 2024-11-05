import {
  groupEntitySchema,
} from '@narval/policy-engine-shared'
import { z } from 'zod'
import { DataV1, Id } from './open-policy-agent.type.v1'


export const Group = groupEntitySchema.extend({
  id: Id,
  users: z.array(Id),
  accounts: z.array(Id)
})
export type Group = z.infer<typeof Group>

export const DataV2 = DataV1.extend({
  entities: DataV1.shape.entities.omit({
    userGroups: true,
    accountGroups: true
  }).extend({
    groups: z.record(Group)
  })
})
export type DataV2 = z.infer<typeof DataV2>
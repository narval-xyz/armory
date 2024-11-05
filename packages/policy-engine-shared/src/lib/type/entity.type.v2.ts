import { z } from 'zod'
import {
  groupEntitySchema,
} from '../schema/entity.schema.v2'

export type GroupEntity = z.infer<typeof groupEntitySchema>

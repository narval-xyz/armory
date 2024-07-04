import { Action } from '@narval/policy-engine-shared'
import { z } from 'zod'
import { createUserOperationSchema, readUserOperationSchema } from './user-operation.schema'

export const readSignUserOperationSchema = z.object({
  action: z.literal(Action.SIGN_USER_OPERATION),
  nonce: z.string(),
  resourceId: z.string(),
  userOperation: readUserOperationSchema
})

export const createSignUserOperationSchema = readSignUserOperationSchema.extend({
  userOperation: createUserOperationSchema
})

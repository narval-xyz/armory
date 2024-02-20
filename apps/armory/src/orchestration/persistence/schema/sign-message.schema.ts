import { Action } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const readSignMessageSchema = z.object({
  action: z.literal(Action.SIGN_MESSAGE),
  nonce: z.string(),
  resourceId: z.string(),
  message: z.string()
})

export const createSignMessageSchema = readSignMessageSchema

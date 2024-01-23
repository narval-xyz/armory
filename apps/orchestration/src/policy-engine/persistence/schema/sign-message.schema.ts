import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { z } from 'zod'

export const readSignMessageSchema = z.object({
  action: z.literal(SupportedAction.SIGN_MESSAGE),
  nonce: z.string(),
  resourceId: z.string(),
  message: z.string()
})

export const createSignMessageSchema = readSignMessageSchema

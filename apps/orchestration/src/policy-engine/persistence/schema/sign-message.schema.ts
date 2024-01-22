import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { z } from 'zod'

export const readSignMessageSchema = z.object({
  action: z.literal(SupportedAction.SIGN_MESSAGE),
  nonce: z.number().min(0),
  message: z.string()
})

export const createSignMessageSchema = readSignMessageSchema

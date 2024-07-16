import { Action, hexSchema } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const readSignMessageSchema = z.object({
  action: z.literal(Action.SIGN_MESSAGE),
  nonce: z.string(),
  resourceId: z.string(),
  message: z.union([z.string(), z.object({ raw: hexSchema })])
})

export const readSignRawSchema = z.object({
  action: z.literal(Action.SIGN_RAW),
  nonce: z.string(),
  resourceId: z.string(),
  rawMessage: hexSchema
})

export const createSignMessageSchema = readSignMessageSchema

export const createSignRawSchema = readSignRawSchema

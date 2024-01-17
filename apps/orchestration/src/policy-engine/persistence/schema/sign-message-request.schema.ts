import { z } from 'zod'

export const readSignMessageRequestSchema = z.object({
  message: z.string()
})

export const createSignMessageRequestSchema = readSignMessageRequestSchema

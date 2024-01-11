import { z } from 'zod'

export const signMessageRequestSchema = z.object({
  message: z.string()
})

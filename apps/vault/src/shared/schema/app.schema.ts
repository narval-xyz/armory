import { z } from 'zod'

export const appSchema = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1),
  masterKey: z.string().min(1).optional()
})

import { z } from 'zod'

export const engineSchema = z.object({
  id: z.string(),
  masterKey: z.string(),
  adminApiKey: z.string()
})

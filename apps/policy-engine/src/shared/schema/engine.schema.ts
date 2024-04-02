import { jwkSchema } from '@narval/signature'
import { z } from 'zod'

export const engineSchema = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1),
  masterKey: z.string().min(1).optional(),
  publicJwk: jwkSchema.optional()
})

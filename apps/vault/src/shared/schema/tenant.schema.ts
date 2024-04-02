import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const tenantSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  engineJwk: publicKeySchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const tenantIndexSchema = z.array(z.string())

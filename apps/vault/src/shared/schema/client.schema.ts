import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const clientSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  engineJwk: publicKeySchema.optional(),

  // JWT Verification Options
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),

  baseUrl: z.string().optional(), // Override if you want to use a different baseUrl for a single client

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const clientIndexSchema = z.array(z.string())

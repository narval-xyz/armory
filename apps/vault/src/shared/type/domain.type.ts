import { Hex, publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const Client = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  engineJwk: publicKeySchema.optional(),

  // JWT verification options.
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),

  // Override if you want to use a different baseUrl for a single client.
  baseUrl: z.string().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type Client = z.infer<typeof Client>

export const App = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1).optional(),
  masterKey: z.string().min(1).optional()
})
export type App = z.infer<typeof App>

export const Wallet = z.object({
  id: z.string().min(1),
  privateKey: z
    .string()
    .regex(/^(0x)?([A-Fa-f0-9]{64})$/)
    .transform((val: string): Hex => val as Hex),
  address: z
    .string()
    .regex(/^0x([A-Fa-f0-9]{40})$/)
    .transform((val: string): Hex => val as Hex)
})
export type Wallet = z.infer<typeof Wallet>

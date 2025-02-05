import { z } from 'zod'

export const BitgoInputCredentials = z.object({
  apiKey: z.string(),
  walletPassphrase: z.string().optional()
})
export type BitgoInputCredentials = z.infer<typeof BitgoInputCredentials>

export const BitgoCredentials = z.object({
  apiKey: z.string().optional(),
  walletPassphrase: z.string().optional()
})
export type BitgoCredentials = z.infer<typeof BitgoCredentials>

import { z } from 'zod'

export const walletSchema = z.object({
  id: z.string().min(1),
  privateKey: z.string().regex(/^(0x)?([A-Fa-f0-9]{64})$/),
  address: z.string().regex(/^0x([A-Fa-f0-9]{40})$/)
})

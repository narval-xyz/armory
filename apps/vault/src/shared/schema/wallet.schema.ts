import { Hex } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const walletSchema = z.object({
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

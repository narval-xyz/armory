import { z } from 'zod'

export const Network = z.object({
  networkId: z.string(),
  coinType: z.number().nullable(),
  name: z.string(),
  anchorageId: z.string().optional(),
  fireblocksId: z.string().optional()
})
export type Network = z.infer<typeof Network>

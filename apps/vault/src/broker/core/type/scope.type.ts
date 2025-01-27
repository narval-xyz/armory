import { z } from 'zod'

export const ConnectionScope = z.object({
  clientId: z.string(),
  connectionId: z.string()
})
export type ConnectionScope = z.infer<typeof ConnectionScope>

import { z } from 'zod'

export const App = z.object({
  id: z.string().min(1),
  adminApiKey: z.string().min(1).optional()
})
export type App = z.infer<typeof App>

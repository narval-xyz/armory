import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const credentialEntitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  key: publicKeySchema
})

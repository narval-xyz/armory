import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

// cluster: z.object({
//   publicKey: publicKeySchema,
//   nodes: z.array(
//     z.object({
//       host: z.string().url(),
//       port: z.number().min(1),
//       publicKey: publicKeySchema
//     })
//   )
// })
//

export const Client = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  dataStore: z.object({
    entityPublicKey: publicKeySchema,
    policyPublicKey: publicKeySchema
  })
})
export type Client = z.infer<typeof Client>

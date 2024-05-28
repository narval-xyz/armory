import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { jwkSchema, publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const PolicyEngineNode = z.object({
  id: z.string().min(1),
  // In case of the client ID in the PE is different than the one in the
  // AS.
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).describe('plaintext secret for authenticating to this node'),
  publicKey: publicKeySchema,
  url: z.string().url()
})
export type PolicyEngineNode = z.infer<typeof PolicyEngineNode>

export const Client = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  dataStore: z.object({
    entityPublicKey: jwkSchema,
    policyPublicKey: jwkSchema
  }),
  policyEngine: z.object({
    nodes: z.array(PolicyEngineNode)
  })
})
export type Client = z.infer<typeof Client>

export const CreateClient = Client.extend({
  id: z.string().min(1).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),
  policyEngine: z.object({
    nodes: z.array(z.string().url()).min(1)
  })
})
export type CreateClient = z.infer<typeof CreateClient>

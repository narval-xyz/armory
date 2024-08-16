import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { jwkSchema, publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const PolicyEngineNode = z.object({
  id: z.string().min(1),
  // In case of the client ID in the PE is different than the one in the AS.
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).describe('plaintext secret for authenticating to this engine node'),
  publicKey: publicKeySchema,
  url: z.string().url()
})
export type PolicyEngineNode = z.infer<typeof PolicyEngineNode>

export const CreateClientInput = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  useManagedDataStore: z.boolean().optional(),
  clientSecret: z.string().min(1).optional(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration,
    allowSelfSignedData: z
      .boolean()
      .default(false)
      .optional()
      .describe('Whether to include the engine key in the entity and policy keys')
  }),
  policyEngineNodes: z.array(z.string()).optional()
})
export type CreateClientInput = z.infer<typeof CreateClientInput>

export const Client = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  clientSecret: z.string().min(1).describe('plaintext secret for authenticating to armory'),
  dataSecret: z.string().min(1).nullable().describe('plaintext secret for authenticating to data store'),
  createdAt: z.date(),
  updatedAt: z.date(),
  dataStore: z.object({
    entityPublicKeys: z.array(jwkSchema).min(1),
    policyPublicKeys: z.array(jwkSchema).min(1)
  }),
  policyEngine: z.object({
    nodes: z.array(PolicyEngineNode)
  })
})
export type Client = z.infer<typeof Client>

export const PublicClient = Client.extend({
  dataStore: Client.shape.dataStore.extend({
    entityDataUrl: z.string().optional(),
    policyDataUrl: z.string().optional()
  }),
  policyEngine: z.object({
    nodes: z.array(
      PolicyEngineNode.extend({
        clientSecret: z.string().min(1).optional()
      })
    )
  })
})
export type PublicClient = z.infer<typeof PublicClient>

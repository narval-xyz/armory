import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const PolicyEngineNode = z.object({
  id: z.string().min(1),
  // In case of the client ID in the PE is different than the one in the
  // AS.
  clientId: z.string().min(1),
  // TODO: Why do we need it? If we do, we MUST add encryption.
  clientSecret: z.string().min(1),
  publicKey: publicKeySchema,
  url: z.string().url()
})
export type PolicyEngineNode = z.infer<typeof PolicyEngineNode>

export const PolicyEngineCluster = z.object({
  nodes: z.array(PolicyEngineNode).min(1)
})
export type PolicyEngineCluster = z.infer<typeof PolicyEngineCluster>

export const CreatePolicyEngineCluster = z.object({
  clientId: z.string(),
  nodes: z.array(z.string().url()).min(1),
  entityDataStore: DataStoreConfiguration,
  policyDataStore: DataStoreConfiguration,
  allowSelfSignedData: z.boolean().optional()
})
export type CreatePolicyEngineCluster = z.infer<typeof CreatePolicyEngineCluster>

import { z } from 'zod'
import { DataStoreConfiguration } from './data-store.type'

export const CreateClient = z.object({
  clientId: z.string().optional(),
  clientSecret: z
    .string()
    .min(1)
    .optional()
    .describe('a secret to be used to authenticate the client, sha256 hex-encoded. If null, will be generated.'), // can be generated with `echo -n "my-api-key" | openssl dgst -sha256 | awk '{print $2}'`
  keyId: z.string().optional().describe('A unique identifier for key that will be used to sign JWTs'),
  entityDataStore: DataStoreConfiguration,
  policyDataStore: DataStoreConfiguration,
  allowSelfSignedData: z
    .boolean()
    .default(false)
    .optional()
    .describe('Whether to include the engine key in the entity and policy keys')
})
export type CreateClient = z.infer<typeof CreateClient>

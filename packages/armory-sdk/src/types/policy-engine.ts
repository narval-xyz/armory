import { AccessToken, DataStoreConfiguration, Decision, Request } from '@narval/policy-engine-shared'
import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const OnboardEngineClientRequest = z.object({
  clientId: z.string().optional(),
  clientSecret: z
    .string()
    .min(1)
    .optional()
    .describe('a secret to be used to authenticate the client, sha256 hex-encoded. If null, will be generated.'), // can be generated with `echo -n "my-api-key" | openssl dgst -sha256 | awk '{print $2}'`
  keyId: z.string().optional().describe('A unique identifier for key that will be used to sign JWTs'),
  entityDataStore: DataStoreConfiguration,
  policyDataStore: DataStoreConfiguration
})
export type OnboardEngineClientRequest = z.infer<typeof OnboardEngineClientRequest>

export const OnboardEngineClientResponse = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  }),
  signer: z.object({
    publicKey: publicKeySchema
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type OnboardEngineClientResponse = z.infer<typeof OnboardEngineClientResponse>

export const SendEvaluationResponse = z.object({
  decision: z.nativeEnum(Decision),
  accessToken: AccessToken.optional(),
  request: Request.optional()
})
export type SendEvaluationResponse = z.infer<typeof SendEvaluationResponse>

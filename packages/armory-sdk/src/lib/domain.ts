import { AccessToken, Decision, Request, addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { Payload, jwkSchema } from '@narval/signature'
import { z } from 'zod'

export const Endpoints = {
  engine: {
    evaluations: '/evaluations'
  },
  vault: {
    sign: '/sign',
    importPrivateKey: '/import/private-key'
  }
} as const
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints]

export const EngineClientConfig = z.object({
  authHost: z.string(),
  authClientId: z.string(),
  authSecret: z.string(),
  signer: jwkSchema
})
export type EngineClientConfig = z.infer<typeof EngineClientConfig>

export const VaultClientConfig = z.object({
  vaultHost: z.string(),
  vaultClientId: z.string(),
  vaultSecret: z.string(),
  signer: jwkSchema
})
export type VaultClientConfig = z.infer<typeof VaultClientConfig>

export const StoreConfig = z.object({
  entityStoreHost: z.string(),
  policyStoreHost: z.string()
})
export type StoreConfig = z.infer<typeof StoreConfig>

export const ArmoryClientConfigInput = z.object({
  authHost: z.string().optional(),
  authSecret: z.string().optional(),
  vaultHost: z.string().optional(),
  vaultSecret: z.string().optional(),
  entityStoreHost: z.string().optional(),
  policyStoreHost: z.string().optional(),
  authClientId: z.string().optional(),
  vaultClientId: z.string().optional(),
  signer: jwkSchema
})
export type ArmoryClientConfigInput = z.infer<typeof ArmoryClientConfigInput>

export const ArmoryClientConfig = z.object({
  ...EngineClientConfig.shape,
  ...VaultClientConfig.shape,
  ...StoreConfig.shape
})
export type ArmoryClientConfig = z.infer<typeof ArmoryClientConfig>

export const SdkPermitResponse = z.object({
  decision: z.literal(Decision.PERMIT),
  accessToken: AccessToken,
  request: Request.optional()
})
export type SdkPermitResponse = z.infer<typeof SdkPermitResponse>

export const SdkEvaluationResponse = z.discriminatedUnion('decision', [SdkPermitResponse])
export type SdkEvaluationResponse = z.infer<typeof SdkEvaluationResponse>

export const ImportPrivateKeyRequest = z.object({
  privateKey: hexSchema,
  walletId: z.string().optional()
})
export type ImportPrivateKeyRequest = z.infer<typeof ImportPrivateKeyRequest>

export const ImportPrivateKeyResponse = z.object({
  walletId: z.string(),
  address: addressSchema
})
export type ImportPrivateKeyResponse = z.infer<typeof ImportPrivateKeyResponse>

export const SignatureRequest = z.object({
  request: Request,
  accessToken: AccessToken
})
export type SignatureRequest = z.infer<typeof SignatureRequest>

export const SignatureResponse = z.object({
  signature: hexSchema
})
export type SignatureResponse = z.infer<typeof SignatureResponse>

export const Htm = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT'
} as const
export type Htm = (typeof Htm)[keyof typeof Htm]
export const HtmSchema = z.nativeEnum(Htm)

export const JwsdHeaderArgs = z.object({
  uri: z.string(),
  htm: HtmSchema,
  jwk: jwkSchema,
  accessToken: AccessToken
})
export type JwsdHeaderArgs = z.infer<typeof JwsdHeaderArgs>

export const SignAccountJwsdArgs = z.object({
  payload: Payload,
  accessToken: AccessToken,
  jwk: jwkSchema,
  uri: z.string(),
  htm: HtmSchema
})
export type SignAccountJwsdArgs = z.infer<typeof SignAccountJwsdArgs>

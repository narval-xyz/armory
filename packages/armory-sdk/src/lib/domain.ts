import {
  AccessToken,
  Decision,
  EntityData,
  Request,
  addressSchema,
  hexSchema,
  policySchema
} from '@narval/policy-engine-shared'
import { Payload, SigningAlg, jwkSchema, privateKeySchema } from '@narval/signature'
import { z } from 'zod'

export const Endpoints = {
  engine: {
    evaluations: '/evaluations',
    sync: '/clients/sync'
  },
  vault: {
    sign: '/sign',
    importPrivateKey: '/import/private-key'
  }
} as const
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints]

export const UserSigner = z.object({
  jwk: jwkSchema,
  alg: z.nativeEnum(SigningAlg).optional(),
  signer: z.function().args(z.string()).returns(z.promise(z.string()))
})

export const EngineClientConfig = UserSigner.extend({
  authHost: z.string(),
  authClientId: z.string(),
  authSecret: z.string().optional()
})
export type EngineClientConfig = z.infer<typeof EngineClientConfig>

export const VaultClientConfig = UserSigner.extend({
  vaultHost: z.string(),
  vaultClientId: z.string()
})
export type VaultClientConfig = z.infer<typeof VaultClientConfig>

export const StoreConfig = z.object({
  entityStoreHost: z.string(),
  policyStoreHost: z.string()
})
export type StoreConfig = z.infer<typeof StoreConfig>

export const ArmoryClientConfigInput = UserSigner.extend({
  authHost: z.string().optional(),
  authSecret: z.string().optional(),
  vaultHost: z.string().optional(),
  entityStoreHost: z.string().optional(),
  policyStoreHost: z.string().optional(),
  authClientId: z.string().optional(),
  vaultClientId: z.string().optional()
})
export type ArmoryClientConfigInput = z.infer<typeof ArmoryClientConfigInput>

export const ArmoryClientConfig = UserSigner.extend({
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
  alg: z.nativeEnum(SigningAlg).optional(),
  accessToken: AccessToken
})
export type JwsdHeaderArgs = z.infer<typeof JwsdHeaderArgs>

export const SignAccountJwsdArgs = UserSigner.extend({
  payload: Payload,
  accessToken: AccessToken,
  uri: z.string(),
  htm: HtmSchema
})
export type SignAccountJwsdArgs = z.infer<typeof SignAccountJwsdArgs>

export const Resource = {
  VAULT: 'vault'
} as const
export type Resource = (typeof Resource)[keyof typeof Resource]
export const ResourceSchema = z.nativeEnum(Resource)

export const Permission = {
  WALLET_IMPORT: 'wallet:import',
  WALLET_CREATE: 'wallet:create',
  WALLET_READ: 'wallet:read'
} as const
export type Permission = (typeof Permission)[keyof typeof Permission]
export const PermissionSchema = z.nativeEnum(Permission)
export const SetPolicyRequest = z.object({
  policies: z.array(policySchema),
  privateKey: privateKeySchema
})
export type SetPolicyRequest = z.infer<typeof SetPolicyRequest>

export const SetEntityRequest = z.object({
  entity: EntityData,
  privateKey: privateKeySchema
})
export type SetEntityRequest = z.infer<typeof SetEntityRequest>

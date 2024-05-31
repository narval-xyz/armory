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
  armory: {
    authorizeRequest: '/authorization-requests'
  },
  engine: {
    evaluations: '/evaluations',
    sync: '/clients/sync'
  },
  vault: {
    sign: '/sign',
    importPrivateKey: '/import/private-keys',
    importSeed: '/import/seeds',
    generateWallet: '/generate/keys',
    deriveWallet: '/derive/wallets'
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

export const DataStoreConfig = z.object({
  entityStoreHost: z.string(),
  policyStoreHost: z.string()
})
export type DataStoreConfig = z.infer<typeof DataStoreConfig>

export const ArmoryClientConfigInput = UserSigner.extend({
  authHost: z.string().optional(),
  authClientId: z.string().optional(),
  authSecret: z.string().optional(),
  vaultHost: z.string().optional(),
  vaultClientId: z.string().optional(),
  entityStoreHost: z.string().optional(),
  policyStoreHost: z.string().optional()
})
export type ArmoryClientConfigInput = z.infer<typeof ArmoryClientConfigInput>

export const ArmoryClientConfig = UserSigner.extend({
  ...EngineClientConfig.shape,
  ...VaultClientConfig.shape,
  ...DataStoreConfig.shape
})
export type ArmoryClientConfig = z.infer<typeof ArmoryClientConfig>

export const SdkEvaluationResponse = z.object({
  decision: z.nativeEnum(Decision),
  accessToken: AccessToken.optional(),
  request: Request.optional()
})
export type SdkEvaluationResponse = z.infer<typeof SdkEvaluationResponse>

export const ImportPrivateKeyRequest = z.object({
  privateKey: hexSchema,
  walletId: z.string().optional(),
  accessToken: AccessToken
})
export type ImportPrivateKeyRequest = z.infer<typeof ImportPrivateKeyRequest>

export const ImportPrivateKeyResponse = z.object({
  id: z.string(),
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

export const AuthorizationRequestStatus = {
  CREATED: 'CREATED',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
  APPROVING: 'APPROVING',
  PERMITTED: 'PERMITTED',
  FORBIDDEN: 'FORBIDDEN'
} as const
export type AuthorizationRequestStatus = (typeof AuthorizationRequestStatus)[keyof typeof AuthorizationRequestStatus]

export const AuthorizationRequest = z.object({
  id: z.string(),
  clientId: z.string(),
  idempotencyKey: z.string().nullable(),
  authentication: z.string(),
  status: z.nativeEnum(AuthorizationRequestStatus),
  evaluations: z.array(
    z.object({
      id: z.string(),
      decision: z.nativeEnum(Decision),
      signature: z.string().nullable().optional()
    })
  ),
  request: Request,
  approvals: z.array(z.string())
})
export type AuthorizationRequest = z.infer<typeof AuthorizationRequest>

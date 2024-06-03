import {
  AccessToken,
  DataStoreConfiguration,
  Decision,
  EntityData,
  Request,
  addressSchema,
  hexSchema,
  policySchema
} from '@narval/policy-engine-shared'
import {
  Payload,
  SigningAlg,
  jwkSchema,
  privateKeySchema,
  publicKeySchema,
  rsaPublicKeySchema
} from '@narval/signature'
import { z } from 'zod'

export const Endpoints = {
  armory: {
    onboardClient: '/clients',
    authorizeRequest: '/authorization-requests'
  },
  engine: {
    onboardClient: '/clients',
    evaluations: '/evaluations',
    sync: '/clients/sync'
  },
  vault: {
    onboardClient: '/clients',
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

export const PolicyEngineNode = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).describe('plaintext secret for authenticating to this node'),
  publicKey: publicKeySchema,
  url: z.string().url()
})
export type PolicyEngineNode = z.infer<typeof PolicyEngineNode>

export const OnboardArmoryClientRequest = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  dataStore: z.object({
    entity: DataStoreConfiguration,
    policy: DataStoreConfiguration
  })
})
export type OnboardArmoryClientRequest = z.infer<typeof OnboardArmoryClientRequest>

export const OnboardArmoryClientResponse = z.object({
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
export type OnboardArmoryClientResponse = z.infer<typeof OnboardArmoryClientResponse>

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

export const OnboardVaultClientRequest = z.object({
  clientId: z.string().optional(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  baseUrl: z.string().optional()
})
export type OnboardVaultClientRequest = z.infer<typeof OnboardVaultClientRequest>

export const OnboardVaultClientResponse = z.object({
  clientId: z.string(),
  engineJwk: publicKeySchema.optional(),
  audience: z.string().optional(),
  issuer: z.string().optional(),
  maxTokenAge: z.number().optional(),
  backupPublicKey: rsaPublicKeySchema.optional(),
  allowKeyExport: z.boolean().optional(),
  baseUrl: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})
export type OnboardVaultClientResponse = z.infer<typeof OnboardVaultClientResponse>
import { AccessToken } from '@narval/policy-engine-shared'
import { Payload, SigningAlg, jwkSchema } from '@narval/signature'
import { z } from 'zod'

export const UserSigner = z.object({
  jwk: jwkSchema,
  alg: z.nativeEnum(SigningAlg).optional(),
  signer: z.function().args(z.string()).returns(z.promise(z.string()))
})
export type UserSigner = z.infer<typeof UserSigner>

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

export const Htm = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT'
} as const
export type Htm = (typeof Htm)[keyof typeof Htm]

export const HtmSchema = z.nativeEnum(Htm)

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

import { Action } from '@narval/policy-engine-shared'
import { Jwk, SigningAlg, jwkSchema } from '@narval/signature'
import { z } from 'zod'

export const Category = {
  WALLET: 'wallet',
  ORGANIZATION: 'organization'
} as const
export type Category = (typeof Category)[keyof typeof Category]

export const SignConfig = z.object({
  jwk: jwkSchema,
  opts: z
    .object({
      alg: z.nativeEnum(SigningAlg).optional()
    })
    .optional(),
  signer: z.function(z.tuple([z.string()]), z.promise(z.string())).optional()
})

export type SignConfig = z.infer<typeof SignConfig>

export const WalletAction = {
  SIGN_TRANSACTION: Action.SIGN_TRANSACTION,
  SIGN_RAW: Action.SIGN_RAW,
  SIGN_MESSAGE: Action.SIGN_MESSAGE,
  SIGN_TYPED_DATA: Action.SIGN_TYPED_DATA
} as const
export type WalletAction = (typeof WalletAction)[keyof typeof WalletAction]

export const OrganizationAction = {
  CREATE_ORGANIZATION: 'createOrganization'
} as const
export type OrganizationAction = (typeof OrganizationAction)[keyof typeof OrganizationAction]

export type ClientConfig = {
  id: string
  secret: string
  url: string
  adminKey: string
  pubKey: Jwk
  signConfig: SignConfig
}

export type Config = {
  engine: ClientConfig
  vault: ClientConfig
  dataStore: DataStoreConfig
  signConfig: SignConfig
}

export type DataStoreConfig = {
  policyUrl: string
  entityUrl: string
  clientId: string
  signConfig: SignConfig
}

export const Endpoints = {
  engine: {
    evaluations: '/evaluations'
  }
} as const
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints]

export const getConfig = (defaultConfig: SignConfig, passedConfig?: SignConfig): SignConfig => {
  if (!passedConfig) return defaultConfig

  const signingOpts = passedConfig?.opts || defaultConfig.opts || {}
  const signer = passedConfig?.signer || defaultConfig.signer
  const jwk = passedConfig?.jwk || defaultConfig?.jwk

  return {
    opts: signingOpts || {},
    signer,
    jwk
  }
}

import { Action } from '@narval-xyz/policy-engine-domain'
import { Jwk, SignConfig } from '@narval-xyz/signature'

export const Category = {
  WALLET: 'wallet',
  ORGANIZATION: 'organization'
} as const
export type Category = (typeof Category)[keyof typeof Category]

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
  defaultSignConfig?: {
    jwk?: Jwk
    opts?: SignConfig
  }
}

export type PolicyEngineConfig = {
  url: string
  adminKey: string
  client: ClientConfig
}

export type VaultConfig = {
  url: string
  adminKey: string
  client: ClientConfig
}

export type NarvalSdkConfig = {
  engine: PolicyEngineConfig
  vault: VaultConfig
  dataStore: DataStoreConfig
}

export type DataStoreConfig = {
  policyUrl: string
  entityUrl: string
}

export const Endpoints = {
  engine: {
    evaluations: '/evaluations'
  }
} as const
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints]

import { Action, Eip712TypedData, Feed, Hex, Prices, TransactionRequest } from '@narval/policy-engine-shared'
import { Jwk, SignConfig, SigningAlg } from '@narval/signature'
import { ZodError } from 'zod'

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
  CREATE_ORGANIZATION: Action.CREATE_ORGANIZATION
} as const
export type OrganizationAction = (typeof OrganizationAction)[keyof typeof OrganizationAction]

export type BuildResponse<T> = { success: true; request: T } | { success: false; error: ZodError }

export type PolicyEngineConfig = {
  url: string
}

export type ClientConfig = {
  id: string
  secret: string
  credential?: Jwk
  defaultSigning?: SignConfig
}

export type NarvalSdkConfig = {
  engine: PolicyEngineConfig
  client: ClientConfig
}

export const Endpoints = {
  engine: {
    evaluations: '/evaluations'
  }
} as const
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints]

export type RequestInput = {
  resourceId: string
  request:
    | { action: 'signTransaction'; transactionRequest: TransactionRequest }
    | { action: 'signRaw'; rawMessage: Hex; signingAlg: SigningAlg }
    | { action: 'signMessage'; message: string }
    | { action: 'signTypedData'; typedData: Eip712TypedData }
  nonce?: string
  approvals?: string[]
  prices?: Prices
  feeds?: Feed<unknown>[]
}

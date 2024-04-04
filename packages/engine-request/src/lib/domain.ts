import { Action } from '@narval/policy-engine-shared'

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

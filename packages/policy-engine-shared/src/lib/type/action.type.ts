import { Alg } from '@narval/signature'
import { Address, TransactionRequest } from './domain.type'
import {
  AccountClassification,
  AccountType,
  CredentialEntity,
  UserGroupMemberEntity,
  UserRole,
  UserWalletEntity,
  WalletGroupMemberEntity
} from './entity.type'

export const Action = {
  CREATE_ORGANIZATION: 'CREATE_ORGANIZATION',

  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  CREATE_CREDENTIAL: 'CREATE_CREDENTIAL',
  ASSIGN_USER_GROUP: 'ASSIGN_USER_GROUP',
  ASSIGN_WALLET_GROUP: 'ASSIGN_WALLET_GROUP',
  ASSIGN_USER_WALLET: 'ASSIGN_USER_WALLET',

  DELETE_USER: 'user:delete',

  REGISTER_WALLET: 'REGISTER_WALLET',
  CREATE_ADDRESS_BOOK_ACCOUNT: 'CREATE_ADDRESS_BOOK_ACCOUNT',
  EDIT_WALLET: 'wallet:edit',
  UNASSIGN_WALLET: 'wallet:unassign',
  REGISTER_TOKENS: 'REGISTER_TOKENS',

  EDIT_USER_GROUP: 'user-group:edit',
  DELETE_USER_GROUP: 'user-group:delete',

  CREATE_WALLET_GROUP: 'wallet-group:create',
  DELETE_WALLET_GROUP: 'wallet-group:delete',

  SET_POLICY_RULES: 'setPolicyRules',

  SIGN_TRANSACTION: 'signTransaction',
  SIGN_RAW: 'signRaw',
  SIGN_MESSAGE: 'signMessage',
  SIGN_TYPED_DATA: 'signTypedData'
} as const

export type Action = (typeof Action)[keyof typeof Action]

// DOMAIN
export type Signature = {
  sig: string
  alg: Alg
  /**
   * Depending on the alg, this may be necessary (e.g., RSA cannot recover the
   * public key from the signature)
   */
  pubKey: string
}

/**
 * Action Types; these correspond to each Action
 */
export type BaseAction = {
  action: Action
  nonce: string
}

export type BaseAdminRequest = {
  /**
   * The initiator signature of the request using `hashRequest` method to ensure
   * SHA256 format.
   */
  authentication: Signature

  /**
   * Approval from the ENGINE; this is the attestation generated by an Evaluation of the action, and now the ENGINE is the consumer of the attestation to do a data change.
   */
  approvals: Signature[]
}

export type SignTransactionAction = BaseAction & {
  action: typeof Action.SIGN_TRANSACTION
  resourceId: string
  transactionRequest: TransactionRequest
}

export type SignMessageAction = BaseAction & {
  action: typeof Action.SIGN_MESSAGE
  resourceId: string
  message: string
}

export type SignTypedDataAction = BaseAction & {
  action: typeof Action.SIGN_TYPED_DATA
  resourceId: string
  typedData: string
}

export type CreateOrganizationAction = BaseAction & {
  action: typeof Action.CREATE_ORGANIZATION
  organization: {
    uid: string
    credential: CredentialEntity
  }
}

export type CreateOrganizationRequest = BaseAdminRequest & {
  request: CreateOrganizationAction
}

export type CreateUserAction = BaseAction & {
  action: typeof Action.CREATE_USER
  user: {
    uid: string
    role: UserRole
    credential?: CredentialEntity
  }
}

export type CreateUserRequest = BaseAdminRequest & {
  request: CreateUserAction
}

export type UpdateUserAction = BaseAction & {
  action: typeof Action.UPDATE_USER
  user: {
    uid: string
    role: UserRole
  }
}

export type UpdateUserRequest = BaseAdminRequest & {
  request: UpdateUserAction
}

export type CreateCredentialAction = BaseAction & {
  action: typeof Action.CREATE_CREDENTIAL
  credential: CredentialEntity
}

export type CreateCredentialRequest = BaseAdminRequest & {
  request: CreateCredentialAction
}

export type AssignUserGroupAction = BaseAction & {
  action: typeof Action.ASSIGN_USER_GROUP
  data: UserGroupMemberEntity
}

export type AssignUserGroupRequest = BaseAdminRequest & {
  request: AssignUserGroupAction
}

export type RegisterWalletAction = BaseAction & {
  action: typeof Action.REGISTER_WALLET
  wallet: {
    uid: string
    address: Address
    accountType: AccountType
    chainId?: number
  }
}

export type RegisterWalletRequest = BaseAdminRequest & {
  request: RegisterWalletAction
}

export type AssignWalletGroupAction = BaseAction & {
  action: typeof Action.ASSIGN_WALLET_GROUP
  data: WalletGroupMemberEntity
}

export type AssignWalletGroupRequest = BaseAdminRequest & {
  request: AssignWalletGroupAction
}

export type AssignUserWalletAction = BaseAction & {
  action: typeof Action.ASSIGN_USER_WALLET
  data: UserWalletEntity
}

export type AssignUserWalletRequest = BaseAdminRequest & {
  request: AssignUserWalletAction
}

export type CreateAddressBookAccountAction = BaseAction & {
  action: typeof Action.CREATE_ADDRESS_BOOK_ACCOUNT
  account: {
    uid: string
    address: Address
    chainId: number
    classification: AccountClassification
  }
}

export type CreateAddressBookAccountRequest = BaseAdminRequest & {
  request: CreateAddressBookAccountAction
}

export type RegisterTokensAction = BaseAction & {
  action: typeof Action.REGISTER_TOKENS
  tokens: {
    uid: string
    address: Address
    chainId: number
    symbol: string
    decimals: number
  }[]
}

export type RegisterTokensRequest = BaseAdminRequest & {
  request: RegisterTokensAction
}

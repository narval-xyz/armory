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

export type AuthCredential = {
  uid: string // sha256 of the pubKey, used as the short identifier
  pubKey: string
  alg: Alg
  userId: string
}

export const UserRole = {
  ROOT: 'root',
  ADMIN: 'admin',
  MEMBER: 'member',
  MANAGER: 'manager'
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const AccountType = {
  EOA: 'eoa',
  AA: '4337'
} as const
export type AccountType = (typeof AccountType)[keyof typeof AccountType]

export const AccountClassification = {
  EXTERNAL: 'external',
  COUNTERPARTY: 'counterparty',
  INTERNAL: 'internal',
  WALLET: 'wallet'
} as const
export type AccountClassification = (typeof AccountClassification)[keyof typeof AccountClassification]

export type UserGroupMembership = {
  userId: string
  groupId: string
}

export type WalletGroupMembership = {
  walletId: string
  groupId: string
}

export type UserWallet = {
  userId: string
  walletId: string
}

export type Signature = {
  sig: string
  alg: Alg
  /**
   * Depending on the alg, this may be necessary (e.g., RSA cannot recover the
   * public key from the signature)
   */
  pubKey: string
}

export const Alg = {
  ES256K: 'ES256K', // secp256k1, an Ethereum EOA
  ES256: 'ES256', // secp256r1, ecdsa but not ethereum
  RS256: 'RS256'
} as const

export type Alg = (typeof Alg)[keyof typeof Alg]

export type Hex = `0x${string}`

export type Address = `0x${string}`

export type AccessList = {
  address: Address
  storageKeys: Hex[]
}[]

export type TransactionRequest = {
  chainId: number
  from: Address
  nonce?: number
  accessList?: AccessList
  data?: Hex
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  to?: Address | null
  type?: '2'
  value?: Hex
}

/**
 * Action Types; these correspond to each Action
 */
type BaseAction = {
  action: Action
  nonce: string
}

type BaseAdminRequest = {
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

export type CreateOrganizationAction = BaseAction & {
  action: typeof Action.CREATE_ORGANIZATION
  organization: {
    uid: string
    credential: AuthCredential
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
    credential?: AuthCredential
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
  credential: AuthCredential
}

export type CreateCredentialRequest = BaseAdminRequest & {
  request: CreateCredentialAction
}

export type AssignUserGroupAction = BaseAction & {
  action: typeof Action.ASSIGN_USER_GROUP
  data: UserGroupMembership
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
  data: WalletGroupMembership
}

export type AssignWalletGroupRequest = BaseAdminRequest & {
  request: AssignWalletGroupAction
}

export type AssignUserWalletAction = BaseAction & {
  action: typeof Action.ASSIGN_USER_WALLET
  data: UserWallet
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
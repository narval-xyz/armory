export enum Action {
  CREATE_USER = 'user:create',
  EDIT_USER = 'user:edit',
  DELETE_USER = 'user:delete',
  CHANGE_USER_ROLE = 'user:change-role',

  CREATE_WALLET = 'wallet:create',
  EDIT_WALLET = 'wallet:edit',
  ASSIGN_WALLET = 'wallet:assign',
  UNASSIGN_WALLET = 'wallet:unassign',

  CREATE_USER_GROUP = 'user-group:create',
  EDIT_USER_GROUP = 'user-group:edit',
  DELETE_USER_GROUP = 'user-group:delete',

  CREATE_WALLET_GROUP = 'wallet-group:create',
  EDIT_WALLET_GROUP = 'wallet-group:edit',
  DELETE_WALLET_GROUP = 'wallet-group:delete',

  SET_POLICY_RULES = 'setPolicyRules',

  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

export type Hex = `0x${string}`

export type Address = `0x${string}`

export type AccessList = {
  address: Address
  storageKeys: Hex[]
}[]

/**
 * @see https://viem.sh/docs/glossary/types#transactiontype
 */
export enum TransactionType {
  LEGACY = 'legacy',
  EIP2930 = 'eip2930',
  EIP1559 = 'eip1559'
}

export type TransactionRequest = {
  chainId: number
  from: Address
  nonce: number
  accessList?: AccessList
  data?: Hex
  gas?: bigint
  to?: Address | null
  type?: `${TransactionType}`
  value?: Hex
}

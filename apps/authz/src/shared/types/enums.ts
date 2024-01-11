export enum BlockchainActions {
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum PolicyManagementActions {
  SET_POLICY_RULES = 'setPolicyRules'
}

export enum ResourceActions {
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
  DELETE_WALLET_GROUP = 'wallet-group:delete'
}

export type Actions = BlockchainActions | PolicyManagementActions | ResourceActions

export enum Intents {
  TRANSFER_NATIVE = 'transferNative',
  TRANSFER_TOKEN = 'transferToken',
  TRANSFER_NFT = 'transferNft',
  CALL_CONTRACT = 'callContract'
}

export enum AccountType {
  EOA = 'eoa',
  AA = '4337'
}

export enum UserRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  MEMBER = 'member',
  MANAGER = 'manager'
}

export enum Decisions {
  ALLOW = 'Allow',
  DENY = 'Deny',
  CONFIRM = 'Confirm'
}

export enum ValueOperators {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne'
}

export enum IdentityOperators {
  IS = 'is',
  IS_NOT = 'is_not',
  CONTAINS = 'contains',
  IN = 'in'
}

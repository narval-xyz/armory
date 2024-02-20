import { Alg } from './action.type'
import { Address } from './domain.type'

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

export type CredentialEntity = {
  uid: string
  pubKey: string
  alg: Alg
  userId: string
}

export type OrganizationEntity = {
  uid: string
}

export type UserEntity = {
  uid: string
  role: UserRole
}

export type UserGroupEntity = {
  uid: string
}

export type UserWalletEntity = {
  userId: string
  walletId: string
}

export type UserGroupMemberEntity = {
  userId: string
  groupId: string
}

export type WalletEntity = {
  uid: string
  address: Address
  accountType: AccountType
  chainId?: number
}

export type WalletGroupEntity = {
  uid: string
}

export type WalletGroupMemberEntity = {
  walletId: string
  groupId: string
}

export type AddressBookAccountEntity = {
  uid: string
  address: Address
  chainId: number
  classification: AccountClassification
}

export type TokenEntity = {
  uid: string
  address: Address
  symbol: string
  chainId: number
  decimals: number
}

export type Entities = {
  addressBook: AddressBookAccountEntity[]
  credentials: CredentialEntity[]
  tokens: TokenEntity[]
  userGroupMembers: UserGroupMemberEntity[]
  userGroups: UserGroupEntity[]
  userWallets: UserWalletEntity[]
  users: UserEntity[]
  walletGroupMembers: WalletGroupMemberEntity[]
  walletGroups: WalletGroupEntity[]
  wallets: WalletEntity[]
}

import { AccountClassification, AccountType, Address, AuthCredential, UserRole } from './action.type'

export type OrganizationEntity = {
  uid: string
}

export type UserEntity = {
  uid: string
  role: UserRole
}

export type UserGroupEntity = {
  uid: string
  users: string[]
}

export type UserWalletEntity = {
  userId: string
  walletId: string
}

export type WalletEntity = {
  uid: string
  address: Address
  accountType: AccountType
  chainId?: number
  assignees?: string[]
}

export type WalletGroupEntity = {
  uid: string
  wallets: string[]
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
  credentials: AuthCredential[]
  tokens: TokenEntity[]
  userGroups: UserGroupEntity[]
  users: UserEntity[]
  walletGroups: WalletGroupEntity[]
  wallets: WalletEntity[]
}

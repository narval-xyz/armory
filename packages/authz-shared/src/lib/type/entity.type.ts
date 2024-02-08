import { AccountClassification, AccountType, Address, UserRole } from './action.type'

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

// TODO (@wcalderipe, 07/02/2024): Are we sure about this schema?
//
// The token definition doesn't reflect the real-world. The symbol and decimals
// can be null.
export type TokenEntity = {
  uid: string
  address: Address
  symbol: string
  chainId: number
  decimals: number
}

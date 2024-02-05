import { AccountClassification, AccountType, Address, UserRole } from '@narval/authz-shared'

// ENTITIES: user, user group, wallet, wallet group, and address book.
export type Organization = {
  uid: string
}

export type User = {
  uid: string // Pubkey
  role: UserRole
}

export type UserGroup = {
  uid: string
  users: string[] // userIds
}

export type Wallet = {
  uid: string
  address: Address
  accountType: AccountType
  chainId?: number
  assignees?: string[] // userIds
}

export type WalletGroup = {
  uid: string
  wallets: string[] // walletIds
}

export type AddressBookAccount = {
  uid: string
  address: Address
  chainId: number
  classification: AccountClassification
}

export type Token = {
  uid: string
  address: string
  symbol: string
  chainId: number
  decimals: number
}

export type RegoData = {
  entities: {
    users: Record<string, User>
    wallets: Record<string, Wallet>
    userGroups: Record<string, UserGroup>
    walletGroups: Record<string, WalletGroup>
    addressBook: Record<string, AddressBookAccount>
    tokens: Record<string, Token>
  }
}

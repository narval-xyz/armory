import { AccountClassification, AccountType, Address, UserRole } from '@narval/policy-engine-shared'

// TODO: GET RID OF THIS FILE BEFORE MERGE

export type User = {
  id: string // Pubkey
  role: UserRole
}

export type UserGroup = {
  id: string
  users: string[] // userIds
}

export type Wallet = {
  id: string
  address: Address
  accountType: AccountType
  chainId?: number
  assignees?: string[] // userIds
}

export type WalletGroup = {
  id: string
  wallets: string[] // walletIds
}

export type AddressBookAccount = {
  id: string
  address: Address
  chainId: number
  classification: AccountClassification
}

export type Token = {
  id: string
  address: Address
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

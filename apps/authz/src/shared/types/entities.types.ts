import { AccountType, UserRoles } from './enums'

type UUID = string

// ENTITIES: user, user group, wallet, wallet group, and address book.
export type User = {
  uid: string // Pubkey
  role: UserRoles
}

export type UserGroup = {
  uid: string
  name: string
  users: string[] // userIds
}

export type Wallet = {
  uid: string
  address: string
  accountType: AccountType
  chainId?: string
  assignees?: string[] // userIds
}

export type WalletGroup = {
  uid: string
  name: string
  wallets: string[] // walletIds
}

export type AddressBookAccount = {
  uid: string
  address: string
  chainId: string
  classification: string
}

export type AddressBook = {
  orgId: UUID
  name: string
  accounts: AddressBookAccount[]
}

export type RolePermission = {
  permit: boolean
  admin_quorum_threshold?: number
}

export type RegoData = {
  entities: {
    users: Record<string, User>
    user_groups: Record<string, UserGroup>
    wallets: Record<string, Wallet>
    wallet_groups: Record<string, WalletGroup>
    address_book: Record<string, AddressBookAccount>
  }
  permissions: Record<string, Record<string, RolePermission>>
}

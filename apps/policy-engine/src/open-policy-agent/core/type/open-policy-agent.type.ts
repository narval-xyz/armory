import {
  AccountClassification,
  AccountType,
  Action,
  Address,
  CredentialEntity,
  Feed,
  SerializedTransactionRequest,
  SerializedUserOperationV6,
  UserRole
} from '@narval/policy-engine-shared'
import { Intent } from '@narval/transaction-request-intent'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { z } from 'zod'
import { resultSchema } from '../schema/open-policy-agent.schema'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never

export type OpenPolicyAgentInstance = PromiseType<ReturnType<typeof loadPolicy>>

export type Input = {
  action: Action
  principal: CredentialEntity
  resource?: { uid: string }
  intent?: Intent
  transactionRequest?: SerializedTransactionRequest
  userOperation?: SerializedUserOperationV6
  permissions?: string[]
  approvals?: CredentialEntity[]
  feeds?: Feed<unknown>[]
}

// TODO: (@wcalderipe, 18/03/24) Check with @samteb how can we replace these
// types by entities defined at @narval/policy-engine-shared.

type User = {
  id: string // Pubkey
  role: UserRole
}

export type UserGroup = {
  id: string
  users: string[] // userIds
}

export type UserAccount = {
  userId: string
  accountId: string
}

type Account = {
  id: string
  address: Address
  accountType: AccountType
  chainId?: number
  assignees?: string[] // userIds
}

export type AccountGroup = {
  id: string
  accounts: string[] // accountIds
}

type AddressBookAccount = {
  id: string
  address: Address
  chainId: number
  classification: AccountClassification
}

type Token = {
  id: string
  address: Address
  symbol: string | null
  chainId: number
  decimals: number
}

export type Data = {
  entities: {
    addressBook: Record<string, AddressBookAccount>
    tokens: Record<string, Token>
    users: Record<string, User>
    userGroups: Record<string, UserGroup>
    accounts: Record<string, Account>
    accountGroups: Record<string, AccountGroup>
    userAccounts: Array<UserAccount>
  }
}

export type Result = z.infer<typeof resultSchema>

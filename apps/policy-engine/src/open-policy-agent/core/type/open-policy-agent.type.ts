import {
  AccountClassification,
  AccountType,
  Action,
  Address,
  ApprovalRequirement,
  CredentialEntity,
  HistoricalTransfer,
  TransactionRequest,
  UserRole
} from '@narval/policy-engine-shared'
import { Intent } from '@narval/transaction-request-intent'
import { loadPolicy } from '@open-policy-agent/opa-wasm'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never

export type OpenPolicyAgentInstance = PromiseType<ReturnType<typeof loadPolicy>>

export type Input = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: CredentialEntity
  resource?: { uid: string }
  approvals: CredentialEntity[]
  transfers?: HistoricalTransfer[]
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

type Wallet = {
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

type AddressBookAccount = {
  id: string
  address: Address
  chainId: number
  classification: AccountClassification
}

type Token = {
  id: string
  address: Address
  symbol: string
  chainId: number
  decimals: number
}

export type Data = {
  entities: {
    users: Record<string, User>
    wallets: Record<string, Wallet>
    userGroups: Record<string, UserGroup>
    walletGroups: Record<string, WalletGroup>
    addressBook: Record<string, AddressBookAccount>
    tokens: Record<string, Token>
  }
}

type MatchedRule = {
  policyName: string
  policyId: string
  // TODO: Check with @samteb why we're not using Decision constant. Can we use
  // it?
  type: 'permit' | 'forbid'
  approvalsSatisfied: ApprovalRequirement[]
  approvalsMissing: ApprovalRequirement[]
}

export type Result = {
  default?: boolean
  permit: boolean
  reasons: MatchedRule[]
}

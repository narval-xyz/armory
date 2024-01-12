import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Actions } from './enums'

// Types ripped from viem; combining a few though because they don't have chainId on txRequest
export type Hex = `0x${string}`
export type Address = `0x${string}`
export type AccessList = { address: Address; storageKeys: Hex[] }[]
export type TransactionRequest<TQuantity = Hex, TIndex = number, TTransactionType = '2'> = {
  /** Contract code or a hashed method call with encoded args */
  data?: Hex
  /** Transaction sender */
  from: Address
  /** Gas provided for transaction execution */
  gas?: TQuantity
  /** Unique number identifying this transaction */
  nonce?: TIndex
  /** Transaction recipient */
  to?: Address | null
  /** Value in wei sent with this transaction */
  value?: TQuantity
  chainId: string | null
  accessList?: AccessList
  type?: TTransactionType
}

export type AuthZRequest = {
  activityType: Actions
  transactionRequest: TransactionRequest
  intent?: Intent
  resourceId: string
}

export type AuthZRequestPayload = {
  authn: {
    signature: `0x${string}` // This is the signed hash of the `request` field
  }
  request: AuthZRequest
  approvalSignatures?: `0x${string}`[] // this is an array of other signed hashes of the `request` field from approvers
}

export enum NarvalDecision {
  Permit = 'Permit',
  Forbid = 'Forbid',
  Confirm = 'Confirm'
}

export enum NarvalEntities {
  User = 'Narval::User',
  UserRole = 'Narval::UserRole',
  UserGroup = 'Narval::UserGroup'
}

export type ApprovalRequirement = {
  policyId: string
  approvalCount: number // Number approvals required
  approvalEntityType: NarvalEntities // The Type of Entity required to approve (Role, Group, User)
  entityIds: string[] // List of the ids of the entities that satisfy the requirement
}

export type AuthZResponse = {
  decision: NarvalDecision
  permitSignature?: `0x${string}`
  transactionRequest?: TransactionRequest
  totalApprovalsRequired?: ApprovalRequirement[]
  approvalsSatisfied?: ApprovalRequirement[]
  approvalsMissing?: ApprovalRequirement[]
}

export type ApprovalSignature = {
  signature: string
  address: string
  userId: string
}

import { Actions, Alg } from './enums'

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

/**
 * The activity/data being authorized. This must include all the data being authorized, and nothing except the data being authorized.
 * This is the data that will be hashed and signed.
 */
export type AuthZRequest = {
  activityType: Actions
  resourceId?: string
  transactionRequest?: TransactionRequest
}

/**
 * A signed sha-256 hash of the `request` field
 */
export type RequestSignature = {
  sig: string
  alg: Alg
  pubKey: string // Depending on the alg, this may be necessary (e.g., RSA cannot recover the public key from the signature)
}

export type AuthZRequestPayload = {
  authn: RequestSignature // The signature of the initiator
  request: AuthZRequest
  approvals?: RequestSignature[] // Other approvals, incl. second factors of the initiator
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
  permitSignature?: RequestSignature // The ENGINE's approval signature
  request?: AuthZRequest // The actual authorized request
  totalApprovalsRequired?: ApprovalRequirement[]
  approvalsSatisfied?: ApprovalRequirement[]
  approvalsMissing?: ApprovalRequirement[]
}

export type VerifiedApproval = {
  signature: string
  userId: string
  credentialId: string // The credential used for this approval
  address?: string // Address, if the Credential is a EOA private key TODO: Do we need this?
}

export type AuthCredential = {
  id: string
  pubKey: string
  alg: Alg
  userId: string
}

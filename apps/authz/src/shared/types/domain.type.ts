import { Action, TransactionRequest } from '@narval/authz-shared'
import { Caip10 } from 'packages/transaction-request-intent/src/lib/caip'

export * from '@narval/authz-shared'

export enum AccountType {
  EOA = 'eoa',
  AA = '4337'
}

export enum UserRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  MEMBER = 'member',
  MANAGER = 'manager'
}

export enum Decisions {
  ALLOW = 'Allow',
  DENY = 'Deny',
  CONFIRM = 'Confirm'
}

export enum ValueOperators {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne'
}

export enum IdentityOperators {
  IS = 'is',
  IS_NOT = 'is_not',
  CONTAINS = 'contains',
  IN = 'in'
}

export enum Alg {
  ES256K = 'ES256K', // secp256k1, an Ethereum EOA
  ES256 = 'ES256', // secp256r1, ecdsa but not ethereum
  RS256 = 'RS256'
}

export enum FiatSymbols {
  USD = 'fiat:usd',
  EUR = 'fiat:eur'
}

export type HistoricalTransfer = {
  amount: string // Amount in the smallest unit of the token (eg. wei for ETH)
  from: Caip10
  to: Caip10 // In case we want spending limit per destination address
  chainId: number
  token: Caip10
  rates: { [keyof in FiatSymbols]: string } // eg. { fiat:usd: '0.01', fiat:eur: '0.02' }
  initiatedBy: string // uid of the user who initiated the spending
  timestamp: number // unix timestamp in ms
}

export type SharedAuthorizationRequest = {
  action: Action
  nonce: string
}

export type SignTransaction = SharedAuthorizationRequest & {
  action: Action.SIGN_TRANSACTION
  resourceId: string
  transactionRequest: TransactionRequest
}

export type SignMessage = SharedAuthorizationRequest & {
  action: Action.SIGN_MESSAGE
  resourceId: string
  message: string
}

export type AuthorizationRequest = SignTransaction | SignMessage

/**
 * The action being authorized.
 *
 * This must include all the data being authorized, and nothing except the data
 * being authorized. This is the data that will be hashed and signed.
 */
export type AuthorizationRequestPayload = {
  /**
   * The initiator signature of the request using `hashRequest` method to ensure
   * SHA256 format.
   */
  authentication: RequestSignature
  /**
   * The authorization request of
   */
  request: AuthorizationRequest
  /**
   * List of approvals required by the policy.
   */
  approvals?: RequestSignature[]
  /**
   * List of known approved transfers (not mined). These are used by policies on
   * the history like spending limits.
   */
  transfers?: HistoricalTransfer[]
}

/**
 * A signed sha-256 hash of the `request` field
 */
export type RequestSignature = {
  sig: string
  alg: Alg
  pubKey: string // Depending on the alg, this may be necessary (e.g., RSA cannot recover the public key from the signature)
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
  approvalCount: number // Number approvals required
  approvalEntityType: NarvalEntities // The Type of Entity required to approve (Role, Group, User)
  entityIds: string[] // List of the ids of the entities that satisfy the requirement
  countPrincipal: boolean
}

export type AuthorizationResponse = {
  decision: NarvalDecision
  permitSignature?: RequestSignature // The ENGINE's approval signature
  request?: AuthorizationRequest // The actual authorized request
  totalApprovalsRequired?: ApprovalRequirement[]
  approvalsMissing?: ApprovalRequirement[]
  approvalsSatisfied?: ApprovalRequirement[]
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

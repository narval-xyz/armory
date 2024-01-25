import { Intent } from '@narval/transaction-request-intent'

/**
 * Proxy the Intent and types to upstream dependencies for convinience.
 */
export { Intent, Intents } from '@narval/transaction-request-intent'

export enum Action {
  CREATE_USER = 'user:create',
  EDIT_USER = 'user:edit',
  DELETE_USER = 'user:delete',
  CHANGE_USER_ROLE = 'user:change-role',

  CREATE_WALLET = 'wallet:create',
  EDIT_WALLET = 'wallet:edit',
  ASSIGN_WALLET = 'wallet:assign',
  UNASSIGN_WALLET = 'wallet:unassign',

  CREATE_USER_GROUP = 'user-group:create',
  EDIT_USER_GROUP = 'user-group:edit',
  DELETE_USER_GROUP = 'user-group:delete',

  CREATE_WALLET_GROUP = 'wallet-group:create',
  EDIT_WALLET_GROUP = 'wallet-group:edit',
  DELETE_WALLET_GROUP = 'wallet-group:delete',

  SET_POLICY_RULES = 'setPolicyRules',

  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum Decision {
  PERMIT = 'Permit',
  FORBID = 'Forbid',
  CONFIRM = 'Confirm'
}

export enum Alg {
  ES256K = 'ES256K', // secp256k1, an Ethereum EOA
  ES256 = 'ES256', // secp256r1, ecdsa but not ethereum
  RS256 = 'RS256'
}

export enum EntityType {
  User = 'Narval::User',
  UserRole = 'Narval::UserRole',
  UserGroup = 'Narval::UserGroup'
}

export type Signature = {
  sig: string
  alg: Alg
  /**
   * Depending on the alg, this may be necessary (e.g., RSA cannot recover the
   * public key from the signature)
   */
  pubKey: string
}

export type Hex = `0x${string}`

export type Address = `0x${string}`

export type AccessList = {
  address: Address
  storageKeys: Hex[]
}[]

/**
 * @see https://viem.sh/docs/glossary/types#transactiontype
 */
export enum TransactionType {
  LEGACY = 'legacy',
  EIP2930 = 'eip2930',
  EIP1559 = 'eip1559'
}

export type TransactionRequest = {
  chainId: number
  from: Address
  nonce?: number
  accessList?: AccessList
  data?: Hex
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  to?: Address | null
  type?: '2'
  value?: Hex
}

export enum FiatCurrency {
  USD = 'fiat:usd',
  EUR = 'fiat:eur'
}

export type HistoricalTransfer = {
  amount: string // Amount in the smallest unit of the token (eg. wei for ETH)
  from: string
  to: string // In case we want spending limit per destination address
  chainId: number
  token: string
  rates: Record<string, string> // eg. { fiat:usd: '0.01', fiat:eur: '0.02' }
  initiatedBy: string // uid of the user who initiated the spending
  timestamp: number // unix timestamp in ms
}

type SharedAuthorizationRequest = {
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

export type Request = SignTransaction | SignMessage

/**
 * The action being authorized.
 *
 * This must include all the data being authorized, and nothing except the data
 * being authorized. This is the data that will be hashed and signed.
 */
export type AuthorizationRequest = {
  /**
   * The initiator signature of the request using `hashRequest` method to ensure
   * SHA256 format.
   */
  authentication: Signature
  /**
   * The authorization request of
   */
  request: Request
  /**
   * List of approvals required by the policy.
   */
  approvals?: Signature[]
  /**
   * List of known approved transfers (not mined). These are used by policies on
   * the history like spending limits.
   */
  transfers?: HistoricalTransfer[]
}

export type ApprovalRequirement = {
  /**
   * The number of requried approvals
   */
  approvalCount: number // Number approvals required
  /**
   * The entity type required to approve.
   */
  approvalEntityType: EntityType
  /**
   * List of entities IDs that must satisfy the requirements.
   */
  entityIds: string[]
  countPrincipal: boolean
}

export type AuthorizationResponse = {
  decision: Decision
  request?: Request
  approvals?: {
    required: ApprovalRequirement[]
    missing: ApprovalRequirement[]
    satisfied: ApprovalRequirement[]
  }
  attestation?: Signature
  transactionRequestIntent?: Intent
}

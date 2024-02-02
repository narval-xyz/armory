import { AssetId } from '@narval/authz-shared'
import { Intent } from '@narval/transaction-request-intent'

/**
 * An action supported on the policy engine.
 */
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

/**
 * The decision of an evaluation request.
 */
export enum Decision {
  PERMIT = 'Permit',
  FORBID = 'Forbid',
  CONFIRM = 'Confirm'
}

/**
 * Supported signature algorithms.
 */
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
 * Represents a collection of prices for different assets present in the
 * authorization request.
 *
 * @example The price of USDC and MATIC in USD and ETH.
 * {
 *   'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
 *     'fiat:usd': 1.000709110429112,
 *     'eip155:1/slip44:60': 0.000427848385194444
 *   },
 *   'eip155:137/slip44:966': {
 *     'fiat:usd': 0.8298557928655559,
 *     'eip155:1/slip44:60': 0.000355103671369873
 *   }
 * }
 */
export type Prices = Record<AssetId, Record<string, number>>

/**
 * The feeds represent arbitrary data collected by the Orchestration and
 * supplied to the Policy Engine for each evaluation request.
 */
export type Feed<Data> = {
  /**
   * The unique feed identifier.
   */
  source: string
  /**
   * The signature of the data acts as an attestation and prevents tampering.
   *
   * Null values are allowed because organizations have the option to not use
   * any trusted data sources if they prefer.
   */
  sig: Signature | null
  data: Data
}

/**
 * The action being authorized.
 *
 * This must include all the data being authorized, and nothing except the data
 * being authorized. This is the data that will be hashed and signed.
 */
export type EvaluationRequest = {
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
  transfers?: HistoricalTransfer[]
  prices?: Prices
  /**
   * Arbitrary data feeds that are necessary for some policies. These may
   * include, for instance, prices and approved transfers.
   */
  feeds?: Feed<unknown>[]
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

export type EvaluationResponse = {
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

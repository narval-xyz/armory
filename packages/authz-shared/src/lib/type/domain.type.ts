import { AssetId } from '../util/caip.util'
import { CreateOrganizationAction, SignMessageAction, SignTransactionAction, Signature } from './action.type'

export enum Decision {
  PERMIT = 'Permit',
  FORBID = 'Forbid',
  CONFIRM = 'Confirm'
}

export enum EntityType {
  User = 'Narval::User',
  UserRole = 'Narval::UserRole',
  UserGroup = 'Narval::UserGroup'
}

/**
 * @see https://viem.sh/docs/glossary/types#transactiontype
 */
export enum TransactionType {
  LEGACY = 'legacy',
  EIP2930 = 'eip2930',
  EIP1559 = 'eip1559'
}

export enum FiatCurrency {
  USD = 'fiat:usd',
  EUR = 'fiat:eur'
}

export type HistoricalTransfer = {
  /**
   * Amount in the smallest unit of the token (eg. wei for ETH).
   */
  amount: string
  from: string
  /**
   * In case we want spending limit per destination address
   */
  to: string
  chainId: number
  token: string
  /**
   * @example
   * { fiat:usd: '0.01', fiat:eur: '0.02' }
   */
  rates: Record<string, string>
  /**
   * UID of the user who initiated the transfer.
   */
  initiatedBy: string
  /**
   * Unix timestamp in milliseconds.
   */
  timestamp: number
}

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

export type Request = SignTransactionAction | SignMessageAction | CreateOrganizationAction

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
}

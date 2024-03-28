import { z } from 'zod'
import { approvalRequirementSchema } from '../schema/domain.schema'
import { AssetId } from '../util/caip.util'
import {
  CreateOrganizationAction,
  type SignMessageAction,
  type SignRawAction,
  type SignTransactionAction,
  type SignTypedDataAction
} from './action.type'

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

export type JwtString = string

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

export type Request =
  | SignTransactionAction
  | SignMessageAction
  | SignTypedDataAction
  | SignRawAction
  | CreateOrganizationAction

/**
 * The feeds represent arbitrary data collected by the Armory and
 * supplied to the Policy Engine for each evaluation request.
 */
export type Feed<Data> = {
  /**
   * The unique feed identifier.
   */
  source: string
  /**
   * The signature of the data acts as an attestation and prevents tampering.
   * in the JWT format
   *
   * Null values are allowed because organizations have the option to not use
   * any trusted data sources if they prefer.
   */
  sig: JwtString | null
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
   * JWT signature of the request property.
   */
  authentication: JwtString
  /**
   * The authorization request.
   */
  request: Request
  /**
   * JWT signatures of the request property.
   */
  approvals?: JwtString[]
  // TODO: Delete transfers. It was replaced by `feeds`.
  transfers?: HistoricalTransfer[]
  prices?: Prices
  /**
   * Arbitrary data feeds that are necessary for some policies. These may
   * include, for instance, prices and approved transfers.
   */
  feeds?: Feed<unknown>[]
}

export type ApprovalRequirement = z.infer<typeof approvalRequirementSchema>

export type AccessToken = {
  value: string // JWT
  // could include a key-proof
}

export type EvaluationResponse = {
  decision: Decision
  request?: Request
  approvals?: {
    required: ApprovalRequirement[]
    missing: ApprovalRequirement[]
    satisfied: ApprovalRequirement[]
  }
  accessToken?: AccessToken
  transactionRequestIntent?: unknown
}

export type Hex = `0x${string}` // DOMAIN

export type Address = `0x${string}` // DOMAIN

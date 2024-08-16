import { ZodTypeAny, z } from 'zod'
import { credentialEntitySchema } from '../schema/entity.schema'
import { ChainAccountId } from '../util/caip.util'
import {
  GrantPermissionAction,
  SerializedTransactionAction,
  SerializedUserOperationAction,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction
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

export const JwtString = z.string().min(1)
export type JwtString = z.infer<typeof JwtString>

export const HistoricalTransfer = z.object({
  amount: z.string().describe('Amount in the smallest unit of the token (eg. wei for ETH)'),
  from: z.string().min(1),
  to: z.string().min(1).describe('In case we want spending limit per destination address'),
  chainId: z.number().min(1),
  token: z.string().min(1),
  /**
   * @example
   * { fiat:usd: '0.01', fiat:eur: '0.02' }
   */
  rates: z.record(z.string()),
  initiatedBy: z.string().min(1).describe('ID of the user who initiated the transfer'),
  timestamp: z.number().describe('Unix timestamp in milliseconds')
})
export type HistoricalTransfer = z.infer<typeof HistoricalTransfer>

const Price = z.record(z.string(), z.number())

export const Prices = z
  .record(ChainAccountId, Price)
  .describe('Represents a collection of prices for different assets present in the authorization request')

/**
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
export type Prices = z.infer<typeof Prices>

export const Request = z.discriminatedUnion('action', [
  SignTransactionAction,
  SignMessageAction,
  SignTypedDataAction,
  SignRawAction,
  SignUserOperationAction,
  GrantPermissionAction
])
export type Request = z.infer<typeof Request>

export const SerializedRequest = z.discriminatedUnion('action', [
  SerializedTransactionAction,
  SignMessageAction,
  SignTypedDataAction,
  SignRawAction,
  SerializedUserOperationAction,
  GrantPermissionAction
])
export type SerializedRequest = z.infer<typeof SerializedRequest>

export const Feed = <Data extends ZodTypeAny>(dataSchema: Data) =>
  z.object({
    source: z.string(),
    sig: JwtString.nullable(),
    data: dataSchema.optional()
    // TODO @samteb: I had to make data optional because of an inference bug in zod.
    // Message sent on their discord https://discord.com/channels/893487829802418277/893488038477434881/1229425954762522825
  })

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
  data?: Data
}

export const EvaluationMetadata = z
  .object({
    audience: z.union([z.string(), z.array(z.string())]).optional(),
    issuer: z.string().optional(),
    issuedAt: z.number().optional(),
    expiresIn: z.number().optional()
  })
  .describe('Metadata for the grant permission access token')
export type EvaluationMetadata = z.infer<typeof EvaluationMetadata>

export const EvaluationRequest = z.object({
  sessionId: z.string().optional().describe('An ID for this request session. Used for MPC.'),
  authentication: JwtString.describe('JWT signature of the request property'),
  request: Request.describe('The request to be authorized'),
  approvals: z.array(JwtString).optional(),
  prices: Prices.optional(),
  feeds: z
    .array(Feed(z.unknown()))
    .optional()
    .describe(
      'Arbitrary data feeds that are necessary for some policies. These may include, for instance, prices and approved transfers'
    ),
  metadata: EvaluationMetadata.optional()
})

export type EvaluationRequest = z.infer<typeof EvaluationRequest>

export const SerializedEvaluationRequest = EvaluationRequest.extend({
  request: SerializedRequest
})
export type SerializedEvaluationRequest = z.infer<typeof SerializedEvaluationRequest>

export const AccessToken = z.object({
  value: JwtString
})
export type AccessToken = z.infer<typeof AccessToken>

export const ApprovalRequirement = z.object({
  approvalCount: z.number().min(0),
  approvalEntityType: z.nativeEnum(EntityType).describe('The number of requried approvals'),
  entityIds: z.array(z.string()).describe('List of entities IDs that must satisfy the requirements'),
  countPrincipal: z.boolean()
})
export type ApprovalRequirement = z.infer<typeof ApprovalRequirement>

export const Approvals = z.object({
  required: z.array(ApprovalRequirement).optional(),
  missing: z.array(ApprovalRequirement).optional(),
  satisfied: z.array(ApprovalRequirement).optional()
})

export type Approvals = z.infer<typeof Approvals>

export const EvaluationResponse = z.object({
  decision: z.nativeEnum(Decision),
  request: Request.optional(),
  approvals: Approvals.optional(),
  principal: credentialEntitySchema.optional().describe('The credential identified as the principal in the request'),
  accessToken: AccessToken.optional(),
  transactionRequestIntent: z.unknown().optional(),
  metadata: EvaluationMetadata.optional()
})
export type EvaluationResponse = z.infer<typeof EvaluationResponse>

export const SerializedEvaluationResponse = EvaluationResponse.extend({
  request: SerializedRequest.optional()
})
export type SerializedEvaluationResponse = z.infer<typeof SerializedEvaluationResponse>

export type Hex = `0x${string}`

export type Address = `0x${string}`

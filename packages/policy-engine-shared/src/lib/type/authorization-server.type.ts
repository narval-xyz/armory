import { z } from 'zod'
import { Action, SerializedTransactionRequest, TransactionRequest } from './action.type'
import { Approvals, JwtString, Request, SerializedRequest } from './domain.type'

export const AuthorizationRequestStatus = {
  CREATED: 'CREATED',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
  APPROVING: 'APPROVING',
  PERMITTED: 'PERMITTED',
  FORBIDDEN: 'FORBIDDEN'
} as const
export type AuthorizationRequestStatus = (typeof AuthorizationRequestStatus)[keyof typeof AuthorizationRequestStatus]

export const Evaluation = z.object({
  id: z.string(),
  decision: z.string(),
  signature: z.string().nullable(),
  transactionRequestIntent: z.unknown().optional(),
  approvalRequirements: Approvals.optional(),
  createdAt: z.coerce.date()
})
export type Evaluation = z.infer<typeof Evaluation>

/**
 * AuthZ actions currently supported by the Armory.
 */
export const SupportedAction = {
  SIGN_TRANSACTION: Action.SIGN_TRANSACTION,
  SIGN_RAW: Action.SIGN_RAW,
  SIGN_MESSAGE: Action.SIGN_MESSAGE,
  SIGN_USER_OPERATION: Action.SIGN_USER_OPERATION,
  SIGN_TYPED_DATA: Action.SIGN_TYPED_DATA,
  GRANT_PERMISSION: Action.GRANT_PERMISSION
} as const
export type SupportedAction = (typeof SupportedAction)[keyof typeof SupportedAction]

const SharedAuthorizationPayload = z.object({
  action: z.nativeEnum(SupportedAction),
  nonce: z.string()
})
type SharedAuthorizationPayload = z.infer<typeof SharedAuthorizationPayload>

export const SignTransaction = SharedAuthorizationPayload.extend({
  action: z.literal(Action.SIGN_TRANSACTION),
  resourceId: z.string(),
  transactionRequest: TransactionRequest
})
export type SignTransaction = z.infer<typeof SignTransaction>

export const SerializedSignTransaction = SignTransaction.extend({
  transactionRequest: SerializedTransactionRequest
})
export type SerializedSignTransaction = z.infer<typeof SerializedSignTransaction>

export const SignMessage = SharedAuthorizationPayload.extend({
  action: z.literal(Action.SIGN_MESSAGE),
  resourceId: z.string(),
  message: z.string()
})
export type SignMessage = z.infer<typeof SignMessage>

export const GrantPermission = SharedAuthorizationPayload.extend({
  action: z.literal(Action.GRANT_PERMISSION),
  resourceId: z.string(),
  permissions: z.array(z.string())
})
export type GrantPermission = z.infer<typeof GrantPermission>

export const AuthorizationRequestError = z.object({
  context: z.any().optional(),
  id: z.string(),
  message: z.string(),
  name: z.string()
})
export type AuthorizationRequestError = z.infer<typeof AuthorizationRequestError>

export const AuthorizationRequestMetadata = z.object({
  audience: z.union([z.string(), z.array(z.string())]).optional(),
  expiresIn: z.number().optional()
})
export type AuthorizationRequestMetadata = z.infer<typeof AuthorizationRequestMetadata>

export const AuthorizationRequest = z.object({
  approvals: z.array(JwtString).optional(),
  authentication: JwtString,
  clientId: z.string(),
  createdAt: z.coerce.date(),
  errors: z.array(AuthorizationRequestError).optional(),
  evaluations: z.array(Evaluation),
  id: z.string(),
  idempotencyKey: z.string().nullish(),
  metadata: AuthorizationRequestMetadata.optional(),
  request: Request,
  status: z.nativeEnum(AuthorizationRequestStatus),
  updatedAt: z.coerce.date()
})
export type AuthorizationRequest = z.infer<typeof AuthorizationRequest>

export const SerializedAuthorizationRequest = AuthorizationRequest.extend({
  request: SerializedRequest
})
export type SerializedAuthorizationRequest = z.infer<typeof SerializedAuthorizationRequest>

export const CreateAuthorizationRequest = AuthorizationRequest.extend({
  approvals: AuthorizationRequest.shape.approvals.optional(),
  createdAt: AuthorizationRequest.shape.createdAt.optional(),
  evaluations: AuthorizationRequest.shape.evaluations.optional(),
  id: AuthorizationRequest.shape.id.optional(),
  status: AuthorizationRequest.shape.status.optional(),
  updatedAt: AuthorizationRequest.shape.updatedAt.optional()
})
export type CreateAuthorizationRequest = z.infer<typeof CreateAuthorizationRequest>

export type AuthorizationRequestProcessingJob = {
  id: string
}

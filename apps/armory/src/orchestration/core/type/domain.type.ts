import { Json } from '@narval/nestjs-shared'
import { Action, JwtString, SerializedTransactionRequest, TransactionRequest } from '@narval/policy-engine-shared'
import { z } from 'zod'

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
  createdAt: z.date()
})
export type Evaluation = z.infer<typeof Evaluation>

/**
 * AuthZ actions currently supported by the Armory.
 */
export const SupportedAction = {
  SIGN_TRANSACTION: Action.SIGN_TRANSACTION,
  SIGN_MESSAGE: Action.SIGN_MESSAGE,
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

export const Request = z.discriminatedUnion('action', [SignTransaction, SignMessage, GrantPermission])
export type Request = z.infer<typeof Request>

export const AuthorizationRequestError = z.object({
  context: Json.optional(),
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
  approvals: z.array(JwtString),
  authentication: JwtString,
  clientId: z.string(),
  createdAt: z.date(),
  errors: z.array(AuthorizationRequestError).optional(),
  evaluations: z.array(Evaluation),
  id: z.string(),
  idempotencyKey: z.string().nullish(),
  metadata: AuthorizationRequestMetadata.optional(),
  request: Request,
  status: z.nativeEnum(AuthorizationRequestStatus),
  updatedAt: z.date()
})
export type AuthorizationRequest = z.infer<typeof AuthorizationRequest>

export const CreateAuthorizationRequest = AuthorizationRequest.extend({
  id: AuthorizationRequest.shape.id.optional(),
  status: AuthorizationRequest.shape.status.optional(),
  createdAt: AuthorizationRequest.shape.createdAt.optional(),
  updatedAt: AuthorizationRequest.shape.updatedAt.optional(),
  approvals: z.array(JwtString)
})
export type CreateAuthorizationRequest = z.infer<typeof CreateAuthorizationRequest>

export type AuthorizationRequestProcessingJob = {
  id: string
}

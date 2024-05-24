import { Action, JwtString, TransactionRequest } from '@narval/policy-engine-shared'
import { OverrideProperties, SetOptional } from 'type-fest'

export enum AuthorizationRequestStatus {
  CREATED = 'CREATED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  APPROVING = 'APPROVING',
  PERMITTED = 'PERMITTED',
  FORBIDDEN = 'FORBIDDEN'
}

export type Evaluation = {
  id: string
  decision: string
  signature: string | null
  createdAt: Date
}

/**
 * AuthZ actions currently supported by the Armory.
 */
export type SupportedAction =
  | typeof Action.SIGN_TRANSACTION
  | typeof Action.SIGN_MESSAGE
  | typeof Action.GRANT_PERMISSION

export type SharedAuthorizationPayload = {
  action: SupportedAction
  resourceId: string
  nonce: string
}

export type SignTransaction = SharedAuthorizationPayload & {
  action: typeof Action.SIGN_TRANSACTION
  transactionRequest: TransactionRequest
}

export type SignMessage = SharedAuthorizationPayload & {
  action: typeof Action.SIGN_MESSAGE
  message: string
}

export type GrantPermission = SharedAuthorizationPayload & {
  action: typeof Action.GRANT_PERMISSION
  permissions: string[]
}

export type Request = SignTransaction | SignMessage | GrantPermission

export type AuthorizationRequest = {
  id: string
  clientId: string
  status: `${AuthorizationRequestStatus}`
  authentication: JwtString
  request: Request
  approvals: JwtString[]
  evaluations: Evaluation[]
  idempotencyKey?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateAuthorizationRequest = OverrideProperties<
  SetOptional<AuthorizationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  {
    approvals: JwtString[]
  }
>

export type AuthorizationRequestProcessingJob = {
  id: string
}

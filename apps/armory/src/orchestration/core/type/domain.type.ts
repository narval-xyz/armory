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
export type SupportedAction = typeof Action.SIGN_TRANSACTION | typeof Action.SIGN_MESSAGE

export type SharedAuthorizationPayload = {
  action: SupportedAction
  nonce: string
}

export type SignTransaction = SharedAuthorizationPayload & {
  action: typeof Action.SIGN_TRANSACTION
  resourceId: string
  transactionRequest: TransactionRequest
}

export type SignMessage = SharedAuthorizationPayload & {
  action: typeof Action.SIGN_MESSAGE
  resourceId: string
  message: string
}

export type Request = SignTransaction | SignMessage

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

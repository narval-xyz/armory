import { Action, Signature, TransactionRequest } from '@narval/authz-shared'
import { OverrideProperties, SetOptional } from 'type-fest'

/**
 * AuthZ actions currently supported by the Orchestration.
 */
export enum SupportedAction {
  SIGN_TRANSACTION = Action.SIGN_TRANSACTION,
  SIGN_MESSAGE = Action.SIGN_MESSAGE
}

export enum AuthorizationRequestStatus {
  CREATED = 'CREATED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  APPROVING = 'APPROVING',
  PERMITTED = 'PERMITTED',
  FORBIDDEN = 'FORBIDDEN'
}

export type Approval = Signature & {
  id: string
  createdAt: Date
}

export type Evaluation = {
  id: string
  decision: string
  signature: string | null
  createdAt: Date
}

export type SharedAuthorizationPayload = {
  action: SupportedAction
  nonce: string
}

export type SignTransaction = SharedAuthorizationPayload & {
  action: SupportedAction.SIGN_TRANSACTION
  resourceId: string
  transactionRequest: TransactionRequest
}

export type SignMessage = SharedAuthorizationPayload & {
  action: SupportedAction.SIGN_MESSAGE
  resourceId: string
  message: string
}

export type Request = SignTransaction | SignMessage

export type AuthorizationRequest = {
  id: string
  orgId: string
  status: `${AuthorizationRequestStatus}`
  authentication: Signature
  request: Request
  approvals: Approval[]
  evaluations: Evaluation[]
  idempotencyKey?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateApproval = SetOptional<Approval, 'id' | 'createdAt'>

export type CreateAuthorizationRequest = OverrideProperties<
  SetOptional<AuthorizationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  {
    approvals: CreateApproval[]
  }
>

export type AuthorizationRequestProcessingJob = {
  id: string
}

import { Action, TransactionRequest } from '@narval/authz-shared'
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

export type Signature = {
  sig: string
  alg: string
  pubKey: string
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

export type SharedAuthorizationRequest = {
  id: string
  orgId: string
  status: `${AuthorizationRequestStatus}`
  /**
   * The hash of the request in EIP-191 format.
   *
   * @see https://eips.ethereum.org/EIPS/eip-191
   * @see https://viem.sh/docs/utilities/hashMessage.html
   * @see https://docs.ethers.org/v5/api/utils/hashing/
   */
  hash: string
  idempotencyKey?: string | null
  authentication: Signature
  approvals: Approval[]
  evaluations: Evaluation[]
  createdAt: Date
  updatedAt: Date
}

export type SignTransactionAuthorizationRequest = SharedAuthorizationRequest & {
  action: `${SupportedAction.SIGN_TRANSACTION}`
  request: TransactionRequest
}

export type MessageRequest = {
  message: string
}

export type SignMessageAuthorizationRequest = SharedAuthorizationRequest & {
  action: `${SupportedAction.SIGN_MESSAGE}`
  request: MessageRequest
}

export type AuthorizationRequest = SignTransactionAuthorizationRequest | SignMessageAuthorizationRequest

export type CreateApproval = SetOptional<Approval, 'id' | 'createdAt'>

export type CreateAuthorizationRequest = OverrideProperties<
  SetOptional<AuthorizationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  {
    approvals: CreateApproval[]
  }
>

export function isSignTransaction(request: AuthorizationRequest): request is SignTransactionAuthorizationRequest {
  return (request as SignTransactionAuthorizationRequest).action === SupportedAction.SIGN_TRANSACTION
}

export function isSignMessage(request: AuthorizationRequest): request is SignMessageAuthorizationRequest {
  return (request as SignMessageAuthorizationRequest).action === SupportedAction.SIGN_MESSAGE
}

export type AuthorizationRequestProcessingJob = {
  id: string
}

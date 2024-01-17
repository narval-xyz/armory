import { SetOptional } from 'type-fest'

export type Evaluation = {
  id: string
  decision: string
  signature: string | null
  createdAt: Date
}

export enum Action {
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_MESSAGE = 'signMessage'
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

export type SharedAuthorizationRequest = {
  id: string
  orgId: string
  initiatorId: string
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
  createdAt: Date
  updatedAt: Date
  evaluations: Evaluation[]
}

export type Hex = `0x${string}`
export type Address = `0x${string}`
export type AccessList = { address: Address; storageKeys: Hex[] }[]

// Original transaction request
//
// export type TransactionRequest<TQuantity = Hex, TIndex = number, TTransactionType = '2'> = {
//   data?: Hex
//   from: Address
//   to?: Address | null
//   gas?: TQuantity
//   nonce: TIndex
//   value?: TQuantity
//   chainId: string | null
//   accessList?: AccessList
//   type?: TTransactionType
// }
// Temporary lite version
export type TransactionRequest = {
  data?: Hex
  from: Address
  to?: Address | null
  gas: bigint
}

export type SignTransactionAuthorizationRequest = SharedAuthorizationRequest & {
  action: `${Action.SIGN_TRANSACTION}`
  request: TransactionRequest
}

export type MessageRequest = {
  message: string
}

export type SignMessageAuthorizationRequest = SharedAuthorizationRequest & {
  action: `${Action.SIGN_MESSAGE}`
  request: MessageRequest
}

export type AuthorizationRequest = SignTransactionAuthorizationRequest | SignMessageAuthorizationRequest

export type CreateAuthorizationRequest = SetOptional<AuthorizationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>

export function isSignTransaction(request: AuthorizationRequest): request is SignTransactionAuthorizationRequest {
  return (request as SignTransactionAuthorizationRequest).action === Action.SIGN_TRANSACTION
}

export function isSignMessage(request: AuthorizationRequest): request is SignMessageAuthorizationRequest {
  return (request as SignMessageAuthorizationRequest).action === Action.SIGN_MESSAGE
}

export type AuthorizationRequestProcessingJob = {
  id: string
}

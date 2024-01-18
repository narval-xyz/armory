import { SetOptional } from 'type-fest'

export type Evaluation = {
  id: string
  decision: string
  signature: string | null
  createdAt: Date
}

// Note: Action is a shared enum w/ every other module
export enum Action {
  // Resource Actions
  CREATE_USER = 'user:create',
  EDIT_USER = 'user:edit',
  DELETE_USER = 'user:delete',
  CHANGE_USER_ROLE = 'user:change-role',
  CREATE_WALLET = 'wallet:create',
  EDIT_WALLET = 'wallet:edit',
  ASSIGN_WALLET = 'wallet:assign',
  UNASSIGN_WALLET = 'wallet:unassign',
  CREATE_USER_GROUP = 'user-group:create',
  EDIT_USER_GROUP = 'user-group:edit',
  DELETE_USER_GROUP = 'user-group:delete',
  CREATE_WALLET_GROUP = 'wallet-group:create',
  EDIT_WALLET_GROUP = 'wallet-group:edit',
  DELETE_WALLET_GROUP = 'wallet-group:delete',

  // Policy Management Actions
  SET_POLICY_RULES = 'setPolicyRules',

  // Wallet Actions
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

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
export type AccessList = {
  address: Address
  storageKeys: Hex[]
}[]

/**
 * @see https://viem.sh/docs/glossary/types#transactiontype
 */
export enum TransactionType {
  LEGACY = 'legacy',
  EIP2930 = 'eip2930',
  EIP1559 = 'eip1559'
}

export type TransactionRequest = {
  chainId: number
  from: Address
  nonce: number
  accessList?: AccessList
  data?: Hex
  gas?: bigint
  to?: Address | null
  type?: `${TransactionType}`
  value?: Hex
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

export type CreateAuthorizationRequest = SetOptional<AuthorizationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>

export function isSignTransaction(request: AuthorizationRequest): request is SignTransactionAuthorizationRequest {
  return (request as SignTransactionAuthorizationRequest).action === SupportedAction.SIGN_TRANSACTION
}

export function isSignMessage(request: AuthorizationRequest): request is SignMessageAuthorizationRequest {
  return (request as SignMessageAuthorizationRequest).action === SupportedAction.SIGN_MESSAGE
}

export type AuthorizationRequestProcessingJob = {
  id: string
}

import { AssetId, ChainAccountId, Eip712TypedData, Hex } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { Intents } from './domain'

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  to: ChainAccountId
  from: ChainAccountId
  token: AssetId
  amount: string
}

export type TransferErc20 = {
  type: Intents.TRANSFER_ERC20
  to: ChainAccountId
  from: ChainAccountId
  token: AssetId
  amount: string
}

export type TransferErc721 = {
  type: Intents.TRANSFER_ERC721
  to: ChainAccountId
  from: ChainAccountId
  contract: ChainAccountId
  token: AssetId
}

export type ERC1155Transfer = {
  token: AssetId
  amount: string
}

export type TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155
  to: ChainAccountId
  from: ChainAccountId
  contract: ChainAccountId
  transfers: ERC1155Transfer[]
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  to?: ChainAccountId // in case we fall back to CallContract from a transfer function
  from: ChainAccountId
  contract: ChainAccountId
  hexSignature: Hex
}

export type SignMessage = {
  type: Intents.SIGN_MESSAGE
  message: string
}

export type SignRaw = {
  type: Intents.SIGN_RAW
  algorithm: Alg
  payload: string
}

export type SignTypedData = {
  type: Intents.SIGN_TYPED_DATA
  typedData: Eip712TypedData
}

export type DeployContract = {
  type: Intents.DEPLOY_CONTRACT
  from: ChainAccountId
  chainId: number
}

export type DeployErc4337Wallet = {
  type: Intents.DEPLOY_ERC_4337_WALLET
  from: ChainAccountId
  bytecode: Hex
  chainId: number
}

export type DeploySafeWallet = {
  type: Intents.DEPLOY_SAFE_WALLET
  from: ChainAccountId
  chainId: number
}

export type RetryTransaction = {
  type: Intents.RETRY_TRANSACTION
}

export type CancelTransaction = {
  type: Intents.CANCEL_TRANSACTION
}

export type ApproveTokenAllowance = {
  type: Intents.APPROVE_TOKEN_ALLOWANCE
  from: ChainAccountId
  token: ChainAccountId
  spender: ChainAccountId
  amount: string
}

export type Permit = {
  type: Intents.PERMIT
  owner: ChainAccountId
  spender: ChainAccountId
  amount: string
  token: ChainAccountId
  deadline: number
}

export type Permit2 = {
  type: Intents.PERMIT2
  owner: ChainAccountId
  spender: ChainAccountId
  amount: string
  token: ChainAccountId
  deadline: number
}

export type UserOperation = {
  type: Intents.USER_OPERATION
  from: ChainAccountId
  entrypoint: ChainAccountId
  operationIntents: Intent[]
}

export type TypedDataIntent = SignTypedData | Permit | Permit2

export type Intent =
  | TransferNative
  | TransferErc20
  | TransferErc721
  | TransferErc1155
  | CallContract
  | ApproveTokenAllowance
  | RetryTransaction
  | CancelTransaction
  | DeployContract
  | DeployErc4337Wallet
  | DeploySafeWallet
  | SignMessage
  | SignRaw
  | SignTypedData
  | Permit
  | Permit2
  | UserOperation

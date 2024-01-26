import { AccountId, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Address, TypedData } from 'viem'
import { Intents } from './domain'

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  to: AccountId
  from: AccountId
  token: AssetId
  amount: string
}

export type TransferErc20 = {
  type: Intents.TRANSFER_ERC20
  to: AccountId
  from: AccountId
  contract: AccountId
  amount: string
}

export type TransferErc721 = {
  type: Intents.TRANSFER_ERC721
  to: AccountId
  from: AccountId
  contract: AccountId
  nftId: AssetId
}

export type ERC1155Transfer = {
  tokenId: AssetId
  amount: string
}

export type TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155
  to: AccountId
  from: AccountId
  contract: AccountId
  transfers: ERC1155Transfer[]
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  to?: AccountId // in case we fall back to CallContract from a transfer function
  from: AccountId
  contract: AccountId
  hexSignature: Hex
}

export type SignMessage = {
  type: Intents.SIGN_MESSAGE
  from: AccountId
  message: string
}

export type SignRawMessage = {
  type: Intents.SIGN_RAW_MESSAGE
  from: AccountId
  message: string
}

export type SignRawPayload = {
  type: Intents.SIGN_RAW_PAYLOAD
  from: AccountId
  algorithm: Alg
  payload: string
}

export type SignTypedData = {
  type: Intents.SIGN_TYPED_DATA
  from: AccountId
  typedData: TypedData
}

export type DeployContract = {
  type: Intents.DEPLOY_CONTRACT
  from: AccountId
  chainId: number
}

export type DeployErc4337Wallet = {
  type: Intents.DEPLOY_ERC_4337_WALLET
  from: AccountId
  bytecode: Hex
  chainId: number
}

export type DeploySafeWallet = {
  type: Intents.DEPLOY_SAFE_WALLET
  from: AccountId
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
  from: AccountId
  token: AccountId
  spender: AccountId
  amount: string
}

export type Permit = {
  type: Intents.PERMIT
  from: AccountId
  spender: AccountId
  amount: string
  deadline: string
}

export type Permit2 = {
  type: Intents.PERMIT2
  from: AccountId
  spender: AccountId
  amount: string
  deadline: string
}

export type UserOperation = {
  type: Intents.USER_OPERATION
  from: AccountId
  entrypoint: AccountId
  operationIntents: Intent[]
  beneficiary: Address
}

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
  | SignRawMessage
  | SignRawPayload
  | SignTypedData
  | Permit
  | Permit2
  | UserOperation

import { Alg, Caip10Id, Caip19Id, Hex } from '@narval/authz-shared'
import { TypedData } from 'viem'
import { Intents } from './domain'

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  to: Caip10Id
  from: Caip10Id
  token: Caip19Id
  amount: string
}

export type TransferErc20 = {
  type: Intents.TRANSFER_ERC20
  to: Caip10Id
  from: Caip10Id
  contract: Caip10Id
  amount: string
}

export type TransferErc721 = {
  type: Intents.TRANSFER_ERC721
  to: Caip10Id
  from: Caip10Id
  contract: Caip10Id
  nftId: Caip19Id
}

export type ERC1155Transfer = {
  tokenId: Caip19Id
  amount: string
}

export type TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155
  to: Caip10Id
  from: Caip10Id
  contract: Caip10Id
  transfers: ERC1155Transfer[]
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  to?: Caip10Id // in case we fall back to CallContract from a transfer function
  from: Caip10Id
  contract: Caip10Id
  hexSignature: Hex
}

export type SignMessage = {
  type: Intents.SIGN_MESSAGE
  from: Caip10Id
  message: string
}

export type SignRawMessage = {
  type: Intents.SIGN_RAW_MESSAGE
  from: Caip10Id
  message: string
}

export type SignRawPayload = {
  type: Intents.SIGN_RAW_PAYLOAD
  from: Caip10Id
  algorithm: Alg
  payload: string
}

export type SignTypedData = {
  type: Intents.SIGN_TYPED_DATA
  from: Caip10Id
  typedData: TypedData
}

export type DeployContract = {
  type: Intents.DEPLOY_CONTRACT
  from: Caip10Id
  chainId: number
}

export type DeployErc4337Wallet = {
  type: Intents.DEPLOY_ERC_4337_WALLET
  from: Caip10Id
  bytecode: Hex
  chainId: number
}

export type DeploySafeWallet = {
  type: Intents.DEPLOY_SAFE_WALLET
  from: Caip10Id
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
  from: Caip10Id
  token: Caip10Id
  spender: Caip10Id
  amount: string
}

export type Permit = {
  type: Intents.PERMIT
  from: Caip10Id
  spender: Caip10Id
  amount: string
  deadline: string
}

export type Permit2 = {
  type: Intents.PERMIT2
  from: Caip10Id
  spender: Caip10Id
  amount: string
  deadline: string
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

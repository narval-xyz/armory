import { Hex, TypedData } from 'viem'
import { Caip10, Caip19 } from './caip'
import { Intents } from './domain'
import { SigningAlgorithm } from './types'

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  to: Caip10
  from: Caip10
  token: Caip19
  amount: string
}

export type TransferErc20 = {
  type: Intents.TRANSFER_ERC20
  to: Caip10
  from: Caip10
  contract: Caip10
  amount: string
}

export type TransferErc721 = {
  type: Intents.TRANSFER_ERC721
  to: Caip10
  from: Caip10
  contract: Caip10
  nftId: Caip19
}

export type TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155
  to: Caip10
  from: Caip10
  contract: Caip10
  assetId: Caip19
  amount: string
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  to?: Caip10 // in case we fall back to CallContract from a transfer function
  from: Caip10
  contract: Caip10
  hexSignature: Hex
}

export type SignMessage = {
  type: Intents.SIGN_MESSAGE
  from: Caip10
  message: string
}

export type SignRawMessage = {
  type: Intents.SIGN_RAW_MESSAGE
  from: Caip10
  message: string
}

export type SignRawPayload = {
  type: Intents.SIGN_RAW_PAYLOAD
  from: Caip10
  algorithm: SigningAlgorithm
  payload: string
}

export type SignTypedData = {
  type: Intents.SIGN_TYPED_DATA
  from: Caip10
  typedData: TypedData
}

export type DeployContract = {
  type: Intents.DEPLOY_CONTRACT
  from: Caip10
  bytecode: string
}

export type DeployErc4337Wallet = {
  type: Intents.DEPLOY_ERC_4337_WALLET
  from: Caip10
  bytecode: string
}

export type DeploySafeWallet = {
  type: Intents.DEPLOY_SAFE_WALLET
  from: Caip10
  bytecode: string
}

export type RetryTransaction = {
  type: Intents.RETRY_TRANSACTION
  from: Caip10
  originalIntent: Intent
}

export type CancelTransaction = {
  type: Intents.CANCEL_TRANSACTION
  from: Caip10
  originalIntent: Intent
}

export type ApproveTokenAllowance = {
  type: Intents.APPROVE_TOKEN_ALLOWANCE
  from: Caip10
  token: Caip10
  spender: Caip10
  amount: string
}

export type Permit = {
  type: Intents.PERMIT
  from: Caip10
  spender: Caip10
  amount: string
  deadline: string
}

export type Permit2 = {
  type: Intents.PERMIT2
  from: Caip10
  spender: Caip10
  amount: string
  deadline: string
}

export type Intent = TransferNative | TransferErc20 | TransferErc721 | CallContract

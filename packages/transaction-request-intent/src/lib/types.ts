import { TransactionRequest } from '@narval/authz-shared'
import { Address, Hex, TypedDataDomain, TypedData as TypedDataParams } from 'viem'
import { Caip10 } from './caip'
import { AssetTypeEnum, InputType, Intents, TransactionCategory, TransactionStatus } from './domain'
import { Intent } from './intent.types'

export type Message = {
  message: string
  chainId: number
  from: Address
}

export enum SigningAlgorithm {
  ECDSA_SECP256K1, // Standard for transactions and messages
  ECDSA_SECP256R1, // An alternative to secp256k1, less common
  ECDSA_KOBLITZ, // Similar to secp256k1 but less used
  ECDSA_BRAINPOOL // Not standard but included for completeness
}

export type Raw = {
  rawData: string
  algorithm: SigningAlgorithm
}

export type TypedData = {
  chainId: string
  from: Address
  types: TypedDataParams
  primaryType: string
  domain: TypedDataDomain
  message: Record<string, unknown>
}

export type MessageInput = {
  type: InputType.MESSAGE
  message: Message
}

export type RawInput = {
  type: InputType.RAW
  raw: Raw
}

export type TypedDataInput = {
  type: InputType.TYPED_DATA
  typedData: TypedData
}

export type ContractRegistry = {
  [key: Caip10]: AssetTypeEnum
}

export type TransactionRegistry = {
  [key: string]: TransactionStatus // tbd
}

export type TransactionInput = {
  type: InputType.TRANSACTION_REQUEST
  txRequest: TransactionRequest
  contractRegistry?: ContractRegistry
  transactionRegistry?: TransactionRegistry
}

export type DecodeTransferInput = {
  to: Hex
  from: Hex
  data: Hex
  chainId: number
  methodId: Hex
  nonce: number
}

export type NativeTransferInput = {
  to: Hex
  from: Hex
  value: Hex
  chainId: number
  nonce: number
}

export type ContractDeploymentInput = {
  from: Hex
  data: Hex
  chainId: number
  nonce: number
}

export type ValidatedInput = DecodeTransferInput | NativeTransferInput | ContractDeploymentInput
export type Validator = (txRequest: TransactionRequest, methodId: Hex) => ValidatedInput
export type ValidatorRegistry = {
  [key in TransactionCategory]: Validator
}

export type ContractInteractionDecoder = (input: DecodeTransferInput) => Intent
export type NativeTransferDecoder = (input: NativeTransferInput) => Intent
export type ContractDeploymentDecoder = (input: ContractDeploymentInput) => Intent

export type NativeTransferIntents = Intents.TRANSFER_NATIVE
export type ContractInteractionIntents =
  | Intents.RETRY_TRANSACTION
  | Intents.CANCEL_TRANSACTION
  | Intents.TRANSFER_ERC20
  | Intents.TRANSFER_ERC721
  | Intents.TRANSFER_ERC1155
  | Intents.CALL_CONTRACT
  | Intents.APPROVE_TOKEN_ALLOWANCE
export type ContractCreationIntents =
  | Intents.DEPLOY_CONTRACT
  | Intents.DEPLOY_ERC_4337_WALLET
  | Intents.DEPLOY_SAFE_WALLET
export type TransactionIntents = NativeTransferIntents | ContractInteractionIntents | ContractCreationIntents

export type ContractInteractionDecoders = {
  [key in ContractInteractionIntents]: ContractInteractionDecoder
}
export type ContractCreationDecoders = {
  [key in ContractCreationIntents]: ContractDeploymentDecoder
}
export type NativeTransferDecoders = {
  [key in NativeTransferIntents]: NativeTransferDecoder
}

export type TransactionDecodersRegistry = {
  [TransactionCategory.NATIVE_TRANSFER]: NativeTransferDecoders
  [TransactionCategory.CONTRACT_INTERACTION]: ContractInteractionDecoders
  [TransactionCategory.CONTRACT_CREATION]: ContractCreationDecoders
}

export type Decoder = (input: ValidatedInput) => Intent
export type DecoderRegistry = {
  [key in Intents]: Decoder
}

export type DecodeInput = TransactionInput | MessageInput | RawInput | TypedDataInput

type DecodeSuccess = {
  success: true
  intent: Intent
}

type DecodeError = {
  success: false
  error: {
    message: string
    status: number
    context: Record<string, unknown>
  }
}

export type SafeIntent = DecodeSuccess | DecodeError

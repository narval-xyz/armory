import { TransactionRequest } from '@narval/authz-shared'
import { Address, Hex, TypedDataDomain, TypedData as TypedDataParams } from 'viem'
import { Caip10 } from './caip'
import { AssetTypeEnum, InputType, TransactionStatus } from './domain'
import { Intent } from './intent.types'
import { SupportedMethodId } from './methodId'

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

export type ContractCallInput = {
  to: Hex
  from: Hex
  data: Hex
  chainId: number
  nonce: number
  methodId: Hex
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
  methodId: SupportedMethodId
}

export type ValidatedInput = ContractCallInput | NativeTransferInput | ContractDeploymentInput

export type ContractInteractionDecoder = (input: ContractCallInput) => Intent
export type NativeTransferDecoder = (input: NativeTransferInput) => Intent

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

export type SafeDecodeOutput = DecodeSuccess | DecodeError

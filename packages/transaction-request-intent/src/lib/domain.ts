import { TransactionRequest } from '@narval/authz-shared'
import { Address, Hex, TypedDataDomain, TypedData as TypedDataParams } from 'viem'
import { Caip10 } from './caip'
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

export type ContractInformation = {
  contractAddress: string
  assetType: AssetTypeEnum
}
export type ContractRegistryInput = {
  contract: Caip10 | { address: Address; chainId: number }
  assetType?: AssetTypeEnum
  walletType?: WalletType
}[]
export type ContractRegistry = Map<Caip10, ContractInformation>

export type TransactionKey = `${Caip10}-${number}`
export type TransactionRegistry = Map<TransactionKey, TransactionStatus>

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
  nonce?: number
  methodId: Hex
}

export type NativeTransferInput = {
  to: Hex
  from: Hex
  value: Hex
  nonce?: number
  chainId: number
}

export type ContractDeploymentInput = {
  from: Hex
  nonce?: number
  data: Hex
  chainId: number
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

export enum InputType {
  TRANSACTION_REQUEST = 'transactionRequest',
  MESSAGE = 'message',
  TYPED_DATA = 'typedData',
  RAW = 'raw'
}

export enum TransactionCategory {
  NATIVE_TRANSFER = 'nativeTransfer',
  CONTRACT_CREATION = 'ContractCreation',
  CONTRACT_INTERACTION = 'ContractCall'
}

export enum TransactionStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum WalletType {
  SAFE = 'safe',
  ERC4337 = 'erc4337',
  UNKNOWN = 'unknown'
}

export enum Intents {
  TRANSFER_NATIVE = 'transferNative',
  TRANSFER_ERC20 = 'transferErc20',
  TRANSFER_ERC721 = 'transferErc721',
  TRANSFER_ERC1155 = 'transferErc1155',
  APPROVE_TOKEN_ALLOWANCE = 'approveTokenAllowance',
  PERMIT = 'permit',
  PERMIT2 = 'permit2',
  CALL_CONTRACT = 'callContract',
  RETRY_TRANSACTION = 'retryTransaction',
  CANCEL_TRANSACTION = 'cancelTransaction',
  DEPLOY_CONTRACT = 'deployContract',
  DEPLOY_ERC_4337_WALLET = 'deployErc4337Wallet',
  DEPLOY_SAFE_WALLET = 'deploySafeWallet',
  SIGN_MESSAGE = 'signMessage',
  SIGN_RAW_MESSAGE = 'signRawMessage',
  SIGN_RAW_PAYLOAD = 'signRawPayload',
  SIGN_TYPED_DATA = 'signTypedData'
}

export enum AssetTypeEnum {
  ERC1155 = 'erc1155',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  NATIVE = 'native',
  UNKNOWN = 'unknown'
}

export enum EipStandardEnum {
  EIP155 = 'eip155'
}

export enum SupportedChains {
  MAINNET = 1,
  POLYGON = 137,
  OPTIMISM = 10
}

export const permit2Address = '0x000000000022d473030f116ddee9f6b43ac78ba3'
export const NULL_METHOD_ID = '0x00000000'

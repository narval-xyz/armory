import {
  Address,
  AssetType,
  ChainAccountId,
  Hex,
  TransactionRequest,
  type Eip712TypedData
} from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { Intent } from './intent.types'
import { MethodsMapping } from './supported-methods'

export type Raw = {
  payload: string
  algorithm: Alg
}

export type RawInput = {
  type: InputType.RAW
  raw: Raw
}

export type TypedDataInput = {
  type: InputType.TYPED_DATA
  typedData: Eip712TypedData
}

export type ContractInformation = {
  factoryType: WalletType
  assetType: AssetType
}
export type ContractRegistryInput = {
  contract: ChainAccountId | { address: Address; chainId: number }
  assetType?: AssetType
  factoryType?: WalletType
}[]
export type ContractRegistry = Map<ChainAccountId, ContractInformation>

export type TransactionKey = `${ChainAccountId}-${number}`
export type TransactionRegistry = Map<TransactionKey, TransactionStatus>

export type TransactionInput = {
  type: InputType.TRANSACTION_REQUEST
  txRequest: TransactionRequest
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

export type Config = {
  contractRegistry?: ContractRegistry
  transactionRegistry?: TransactionRegistry
  supportedMethods?: MethodsMapping
}
export type DecodeInput = TransactionInput | RawInput | TypedDataInput

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
  SIGN_RAW = 'signRaw',
  SIGN_TYPED_DATA = 'signTypedData',
  USER_OPERATION = 'userOperation'
}

export enum Misc {
  UNKNOWN = 'unknown'
}

export type AssetTypeAndUnknown = AssetType | Misc.UNKNOWN

export enum SupportedChains {
  ETHEREUM = 1,
  POLYGON = 137,
  OPTIMISM = 10,
  BNB = 56,
  FTM = 250,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  CELO = 42220
}

export enum Slip44SupportedAddresses {
  ETH = 60,
  MATIC = 966,
  BNB = 714,
  FTM = 1007,
  ARBITRUM = 9001,
  AVALANCHE = 9000,
  CELO = 52752
}
export const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'
export const NULL_METHOD_ID = '0x00000000'
export const PERMIT2_DOMAIN = {
  name: 'Permit2',
  chainId: 137,
  verifyingContract: PERMIT2_ADDRESS
}

type Permit2Details = {
  owner: Address
  amount: Hex
  nonce: number
  expiration: number
  token: Address
}

export type Permit2Message = {
  spender: Address
  details: Permit2Details
}

export type PermitMessage = {
  owner: Address
  spender: Address
  value: Hex
  nonce: number
  deadline: number
}

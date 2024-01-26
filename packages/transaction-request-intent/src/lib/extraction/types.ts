import { Address, Hex } from '@narval/authz-shared'

export type Erc721SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: string
}

export type Erc1155SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: string
  amount: string
  data: Hex
}

export type TransferParams = {
  recipient: Hex
  amount: string
}

export type ApproveAllowanceParams = {
  spender: Hex
  amount: string
}

export type TransferFromParams = {
  sender: Hex
  recipient: Hex
  amount: string
}

export type SafeBatchTransferFromParams = {
  from: Hex
  to: Hex
  tokenIds: string[]
  amounts: string[]
  data: Hex
}

export type CreateAccountParams = {
  salt: string
  pubKey: Hex
}

export type ExecuteParams = {
  to: Address
  value: bigint
  data: Hex
}

export type ExecuteAndRevertParams = {
  to: Address
  value: bigint
  data: Hex
  operation: 'call' | 'delegatecall'
}

export type UserOp = {
  sender: Address
  nonce: string
  initCode: Hex
  callData: Hex
  callGasLimit: string
  verifyGasLimit: string
  preVerificationGas: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  paymasterAndData: Hex
  signature: Hex
}

export type HandleOpsParams = {
  userOps: UserOp[]
  beneficiary: Address
}

export type NullHexParams = Record<string, never>

export type ExtractedParams =
  | Erc721SafeTransferFromParams
  | TransferParams
  | TransferFromParams
  | Erc1155SafeTransferFromParams
  | SafeBatchTransferFromParams
  | ApproveAllowanceParams
  | HandleOpsParams
  | CreateAccountParams
  | ExecuteParams
  | ExecuteAndRevertParams
  | NullHexParams

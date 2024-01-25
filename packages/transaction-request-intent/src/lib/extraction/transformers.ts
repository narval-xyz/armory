import { assertArray, assertBigInt, assertLowerHexString } from '../typeguards'
import {
  ApproveAllowanceParams,
  Erc1155SafeTransferFromParams,
  Erc721SafeTransferFromParams,
  ExtractedParams,
  SafeBatchTransferFromParams,
  TransferFromParams,
  TransferParams,
  UserOpsParams
} from './types'

export const TransferParamsTransform = (params: unknown[]): TransferParams => {
  const recipient = assertLowerHexString(params[0])
  const amount = assertBigInt(params[1])
  return { recipient, amount: amount.toString().toLowerCase() }
}

export const TransferBatchTransferParamsTransform = (params: unknown[]): SafeBatchTransferFromParams => {
  const from = assertLowerHexString(params[0])
  const to = assertLowerHexString(params[1])
  const tokenIds = assertArray<bigint>(params[2], 'bigint')
  const amounts = assertArray<bigint>(params[3], 'bigint')
  const data = assertLowerHexString(params[4])
  const stringAmounts = amounts.map((amount) => amount.toString().toLowerCase())
  const stringTokenIds = tokenIds.map((tokenId) => tokenId.toString().toLowerCase())
  return { from, to, tokenIds: stringTokenIds, amounts: stringAmounts, data }
}

export const Erc1155SafeTransferFromParamsTransform = (params: unknown[]): Erc1155SafeTransferFromParams => {
  const from = assertLowerHexString(params[0])
  const to = assertLowerHexString(params[1])
  const tokenId = assertBigInt(params[2])
  const amount = assertBigInt(params[3])
  const data = assertLowerHexString(params[4])
  return { from, to, tokenId: tokenId.toString().toLowerCase(), amount: amount.toString().toLowerCase(), data }
}

export const TransferFromParamsTransform = (params: unknown[]): TransferFromParams => {
  const sender = assertLowerHexString(params[0])
  const recipient = assertLowerHexString(params[1])
  const amount = assertBigInt(params[2])
  return { sender, recipient, amount: amount.toString().toLowerCase() }
}

export const ApproveAllowanceParamsTransform = (params: unknown[]): ApproveAllowanceParams => {
  const spender = assertLowerHexString(params[0])
  const amount = assertBigInt(params[1])
  return { spender, amount: amount.toString().toLowerCase() }
}

export const Erc721SafeTransferFromParamsTransform = (params: unknown[]): Erc721SafeTransferFromParams => {
  const from = assertLowerHexString(params[0])
  const to = assertLowerHexString(params[1])
  const tokenId = assertBigInt(params[2])
  return { from, to, tokenId: tokenId.toString().toLowerCase() }
}

export const UserOpsParamsTransform = (params: unknown[]): UserOpsParams => {
  const sender = assertLowerHexString(params[0])
  const nonce = assertBigInt(params[1])
  const initCode = assertLowerHexString(params[2])
  const callData = assertLowerHexString(params[3])
  const callGasLimit = assertBigInt(params[4])
  const verifyGasLimit = assertBigInt(params[5])
  const preVerificationGas = assertBigInt(params[6])
  const maxFeePerGas = assertBigInt(params[7])
  const maxPriorityFeePerGas = assertBigInt(params[8])
  const paymasterAndData = assertLowerHexString(params[9])
  const signature = assertLowerHexString(params[10])
  return {
    sender,
    nonce: nonce.toString().toLowerCase(),
    initCode,
    callData,
    callGasLimit: callGasLimit.toString().toLowerCase(),
    verifyGasLimit: verifyGasLimit.toString().toLowerCase(),
    preVerificationGas: preVerificationGas.toString().toLowerCase(),
    maxFeePerGas: maxFeePerGas.toString().toLowerCase(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString().toLowerCase(),
    paymasterAndData,
    signature
  }
}

export type Transformer = (params: unknown[]) => ExtractedParams

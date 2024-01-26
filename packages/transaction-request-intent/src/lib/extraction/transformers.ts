import { assertAddress, assertArray, assertBigInt, assertHexString, assertLowerHexString } from '../typeguards'
import {
  ApproveAllowanceParams,
  CreateAccountParams,
  Erc1155SafeTransferFromParams,
  Erc721SafeTransferFromParams,
  ExecuteAndRevertParams,
  ExecuteParams,
  ExtractedParams,
  HandleOpsParams,
  SafeBatchTransferFromParams,
  TransferFromParams,
  TransferParams,
  UserOp
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

export const CreateAccountParamsTransform = (params: unknown[]): CreateAccountParams => {
  const salt = assertLowerHexString(params[0])
  const pubKey = assertLowerHexString(params[1])
  return { salt, pubKey }
}

export const ExecuteParamsTransform = (params: unknown[]): ExecuteParams => {
  const to = assertLowerHexString(params[0])
  const value = assertBigInt(params[1])
  const data = assertLowerHexString(params[2])
  return { to, value, data }
}

export const ExecuteAndRevertParamsTransform = (params: unknown[]): ExecuteAndRevertParams => {
  const to = assertLowerHexString(params[0])
  const value = assertBigInt(params[1])
  const data = assertLowerHexString(params[2])
  const operation = params[3] === 'call' || params[3] === 'delegatecall' ? params[3] : 'call'
  return { to, value, data, operation }
}

export const transformUserOperation = (op: unknown[]): UserOp => {
  if (typeof op !== 'object' || op === null) {
    throw new Error('UserOperation is not an object')
  }

  return {
    sender: assertAddress(op[0]),
    nonce: assertBigInt(op[1]).toString(),
    initCode: assertHexString(op[2]),
    callData: assertHexString(op[3]),
    callGasLimit: assertBigInt(op[4]).toString(),
    verifyGasLimit: assertBigInt(op[5]).toString(),
    preVerificationGas: assertBigInt(op[6]).toString(),
    maxFeePerGas: assertBigInt(op[7]).toString().toLowerCase(),
    maxPriorityFeePerGas: assertBigInt(op[8]).toString(),
    paymasterAndData: assertHexString(op[9]),
    signature: assertHexString(op[10])
  }
}

export const HandleOpsParamsTransform = (params: unknown[]): HandleOpsParams => {
  if (!Array.isArray(params[0]) || typeof params[1] !== 'string') {
    throw new Error('Invalid input format')
  }
  return {
    userOps: params[0].map(transformUserOperation),
    beneficiary: assertAddress(params[1])
  }
}

export type Transformer = (params: unknown[]) => ExtractedParams

import { assertAddress, assertArray, assertBigInt, assertHexString } from '@narval/policy-engine-shared'
import { Hex } from 'viem'
import { DecoderError } from '../error'
import {
  ApproveAllowanceParams,
  CreateAccountParams,
  Erc1155SafeTransferFromParams,
  Erc721SafeTransferFromParams,
  ExecuteAndRevertParams,
  ExecuteBatchV6Params,
  ExecuteBatchV7Params,
  ExecuteParams,
  ExtractedParams,
  SafeBatchTransferFromParams,
  TransferFromParams,
  TransferParams,
  UserOp
} from './types'

export const TransferParamsTransform = (params: unknown[]): TransferParams => {
  const recipient = assertHexString(params[0])
  const amount = assertBigInt(params[1])

  if (!recipient || !amount) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }
  return { recipient, amount: amount.toString().toLowerCase() }
}

export const TransferBatchTransferParamsTransform = (params: unknown[]): SafeBatchTransferFromParams => {
  const from = assertHexString(params[0])
  const to = assertHexString(params[1])
  const tokenIds = assertArray<bigint>(params[2], 'bigint')
  const amounts = assertArray<bigint>(params[3], 'bigint')
  const data = assertHexString(params[4])

  if (!from || !to || !tokenIds || !amounts || !data) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  const stringAmounts = amounts.map((amount) => amount.toString().toLowerCase())
  const stringTokenIds = tokenIds.map((tokenId) => tokenId.toString().toLowerCase())
  return { from, to, tokenIds: stringTokenIds, amounts: stringAmounts, data }
}

export const Erc1155SafeTransferFromParamsTransform = (params: unknown[]): Erc1155SafeTransferFromParams => {
  const from = assertHexString(params[0])
  const to = assertHexString(params[1])
  const tokenId = assertBigInt(params[2])
  const amount = assertBigInt(params[3])
  const data = assertHexString(params[4])

  if (!from || !to || !tokenId || !amount || !data) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }
  return { from, to, tokenId: tokenId.toString().toLowerCase(), amount: amount.toString().toLowerCase(), data }
}

export const TransferFromParamsTransform = (params: unknown[]): TransferFromParams => {
  const sender = assertHexString(params[0])
  const recipient = assertHexString(params[1])
  const amount = assertBigInt(params[2])

  if (!sender || !recipient || !amount) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { sender, recipient, amount: amount.toString().toLowerCase() }
}

export const ApproveAllowanceParamsTransform = (params: unknown[]): ApproveAllowanceParams => {
  const spender = assertHexString(params[0])
  const amount = assertBigInt(params[1])
  if (!spender || !amount) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }
  return { spender, amount: amount.toString().toLowerCase() }
}

export const Erc721SafeTransferFromParamsTransform = (params: unknown[]): Erc721SafeTransferFromParams => {
  const from = assertHexString(params[0])
  const to = assertHexString(params[1])
  const tokenId = assertBigInt(params[2])

  if (!from || !to || (!tokenId && tokenId !== BigInt(0))) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { from, to, tokenId: tokenId.toString().toLowerCase() }
}

export const CreateAccountParamsTransform = (params: unknown[]): CreateAccountParams => {
  const salt = assertHexString(params[0])
  const pubKey = assertHexString(params[1])

  if (!salt || !pubKey) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { salt, pubKey }
}

export const ExecuteParamsTransform = (params: unknown[]): ExecuteParams => {
  const to = assertHexString(params[0])
  const value = assertBigInt(params[1])
  const data = assertHexString(params[2])

  // value can be 0 so we must be explicit that we check for non null value
  if (!to || value === null || data === null) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { to, value, data }
}

export const ExecuteBatchV6ParamsTransform = (params: unknown[]): ExecuteBatchV6Params => {
  const to = assertArray<Hex>(params[0], 'hex')
  const data = assertArray<Hex>(params[1], 'hex')

  if (!to || !data) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { to, data }
}

export const ExecuteBatchV7ParamsTransform = (params: unknown[]): ExecuteBatchV7Params => {
  const to = assertArray<Hex>(params[0], 'hex')
  const value = assertArray<bigint>(params[1], 'bigint')
  const data = assertArray<Hex>(params[2], 'hex')

  if (!to || !value || !data) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { to, value, data }
}

export const ExecuteAndRevertParamsTransform = (params: unknown[]): ExecuteAndRevertParams => {
  const to = assertHexString(params[0])
  const value = assertBigInt(params[1])
  const data = assertHexString(params[2])
  const operation = params[3] === 'call' || params[3] === 'delegatecall' ? params[3] : 'call'

  if (!to || !value || !data || !operation) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return { to, value, data, operation }
}

export const transformUserOperation = (op: unknown[]): UserOp => {
  if (typeof op !== 'object' || op === null) {
    throw new DecoderError({ message: 'UserOperation is not an object', status: 400 })
  }

  const sender = assertAddress(op[0])
  const nonce = assertBigInt(op[1])
  const initCode = assertHexString(op[2])
  const callData = assertHexString(op[3])
  const callGasLimit = assertBigInt(op[4])
  const verifyGasLimit = assertBigInt(op[5])
  const preVerificationGas = assertBigInt(op[6])
  const maxFeePerGas = assertBigInt(op[7])
  const maxPriorityFeePerGas = assertBigInt(op[8])
  const paymasterAndData = assertHexString(op[9])
  const signature = assertHexString(op[10])

  if (
    !sender ||
    !nonce ||
    !initCode ||
    !callData ||
    !callGasLimit ||
    !verifyGasLimit ||
    !preVerificationGas ||
    !maxFeePerGas ||
    !maxPriorityFeePerGas ||
    !paymasterAndData ||
    !signature
  ) {
    throw new DecoderError({ message: 'Invalid parameters', status: 400 })
  }

  return {
    sender,
    nonce: nonce.toString(),
    initCode,
    callData,
    callGasLimit: callGasLimit.toString(),
    verifyGasLimit: verifyGasLimit.toString(),
    preVerificationGas: preVerificationGas.toString(),
    maxFeePerGas: maxFeePerGas.toString().toLowerCase(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    paymasterAndData,
    signature
  }
}

export type Transformer = (params: unknown[]) => ExtractedParams

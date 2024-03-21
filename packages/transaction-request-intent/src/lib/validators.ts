import { Hex, TransactionRequest } from '@narval/policy-engine-shared'
import { ContractCallInput, ContractDeploymentInput, NativeTransferInput } from './domain'
import { DecoderError } from './error'

export const validateNativeTransferInput = (txRequest: TransactionRequest): NativeTransferInput => {
  const { value, chainId, to, from, nonce } = txRequest
  if (!value || !chainId || !to || !from) {
    throw new DecoderError({
      message: 'Malformed native transfer transaction request: missing value, chainId, to, or from',
      status: 400,
      context: {
        value,
        chainId,
        txRequest
      }
    })
  }
  return { to, from, value, chainId, nonce }
}

export const validateContractInteractionInput = (txRequest: TransactionRequest, methodId: Hex): ContractCallInput => {
  const { data, to, chainId, from, nonce } = txRequest
  if (!data || !to || !chainId) {
    throw new DecoderError({
      message: 'Malformed transfer transaction request: missing data, chainId, or to',
      status: 400,
      context: {
        chainId,
        data,
        to,
        nonce,
        txRequest
      }
    })
  }
  const dataWithoutMethodId = `0x${data.slice(10)}` as Hex

  return { data: dataWithoutMethodId, to, chainId, from, nonce, methodId }
}

export const validateContractDeploymentInput = (txRequest: TransactionRequest): ContractDeploymentInput => {
  const { data, chainId, from, to } = txRequest
  if (!data || !chainId || to) {
    throw new DecoderError({
      message: 'Malformed contract deployment transaction request: missing data, chainId, or to',
      status: 400,
      context: {
        chainId,
        data,
        txRequest
      }
    })
  }
  return { data, chainId, from }
}

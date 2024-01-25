import { Hex, TransactionRequest } from '@narval/authz-shared'
import { ContractCallInput, ContractDeploymentInput, NativeTransferInput } from './domain'
import { TransactionRequestIntentError } from './error'

export const validateNativeTransferInput = (txRequest: TransactionRequest): NativeTransferInput => {
  const { value, chainId, to, from, nonce } = txRequest
  if (!value || !chainId || !to || !from) {
    throw new TransactionRequestIntentError({
      message: 'Malformed native transfer transaction request: missing value or chainId',
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
    throw new TransactionRequestIntentError({
      message: 'Malformed transfer transaction request: missing data || chainId || to',
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
    throw new TransactionRequestIntentError({
      message: 'Malformed contract deployment transaction request: missing data || chainId',
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

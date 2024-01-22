import { TransactionRequest } from '@narval/authz-shared'
import { Hex } from 'viem'
import { ContractCallInput, NativeTransferInput } from './domain'
import { TransactionRequestIntentError } from './error'

export const validateNativeTransferInput = (txRequest: TransactionRequest): NativeTransferInput => {
  const { value, chainId, to, from, nonce } = txRequest
  if (!value || !chainId || !to || !from || !nonce) {
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
  if (!data || !to || !chainId || !nonce) {
    throw new TransactionRequestIntentError({
      message: 'Malformed transfer transaction request: missing data || chainId || to || nonce',
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

  return { nonce, data: dataWithoutMethodId, to, chainId, from, methodId }
}

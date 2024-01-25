import { TransactionRequest } from '@narval/authz-shared'
import { Hex } from 'viem'
import { ContractCallInput, ContractDeploymentInput, NativeTransferInput } from './domain'
import { TransactionRequestIntentError } from './error'

export const validateNativeTransferInput = (txRequest: TransactionRequest): NativeTransferInput => {
  const { value, chainId, to, from, nonce } = txRequest
  if (!value || !chainId || !to || !from) {
    console.log('\n\nWhat triggers error?: ', txRequest, '\n\n')
    console.log('\n\nWhat triggers error?: ', value, chainId, to, from, '\n\n')
    console.log('\nvalue: ', !!value, '\nchainId: ', !!chainId, '\nto: ', !!to, '\nfrom: ', !!from, '\n\n')
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

  return { data: dataWithoutMethodId, to, chainId, from, nonce, methodId }
}

export const validateContractDeploymentInput = (txRequest: TransactionRequest): ContractDeploymentInput => {
  const { data, chainId, from, nonce, to } = txRequest
  if (!data || !chainId || !nonce || to) {
    throw new TransactionRequestIntentError({
      message: 'Malformed contract deployment transaction request: missing data || chainId || nonce',
      status: 400,
      context: {
        chainId,
        data,
        nonce,
        txRequest
      }
    })
  }
  return { data, chainId, from }
}

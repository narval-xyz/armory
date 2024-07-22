import {
  TransactionRequest,
  TransactionRequestEIP1559,
  TransactionRequestLegacy,
  getTxType
} from '@narval/policy-engine-shared'
import { TransactionRequest as SignableTransactionRequest, hexToBigInt, transactionType } from 'viem'

export const buildSignableTransactionRequest = (transactionRequest: TransactionRequest): SignableTransactionRequest => {
  const type = getTxType(transactionRequest)

  const value =
    transactionRequest.value === undefined || transactionRequest.value === '0x'
      ? undefined
      : hexToBigInt(transactionRequest.value)

  switch (type) {
    case '2': {
      const tx = TransactionRequestEIP1559.parse(transactionRequest)
      return {
        from: tx.from,
        to: tx.to,
        nonce: tx.nonce,
        data: tx.data,
        gas: tx.gas,
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        type: transactionType['0x2'],
        value
      }
    }
    case '0': {
      const tx = TransactionRequestLegacy.parse(transactionRequest)
      return {
        from: tx.from,
        to: tx.to,
        nonce: tx.nonce,
        data: tx.data,
        gas: tx.gas,
        gasPrice: tx.gasPrice,
        type: transactionType['0x0'],
        value
      }
    }
    default: {
      return {
        from: transactionRequest.from,
        to: transactionRequest.to,
        nonce: transactionRequest.nonce,
        data: transactionRequest.data,
        gas: transactionRequest.gas,
        type: transactionType['0x0'],
        value
      }
    }
  }
}

import { TransactionRequest, TransactionRequestEIP1559, TransactionRequestLegacy } from '@narval/policy-engine-shared'
import { TransactionRequest as SignableTransactionRequest, hexToBigInt, transactionType } from 'viem'
import { buildSignableTransactionRequest } from '../../build-transaction.util'

describe('buildSignableTransactionRequest', () => {
  it('builds a signable transaction request for EIP1559 transaction type', () => {
    const transactionRequest: TransactionRequestEIP1559 = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      chainId: 137,
      value: '0x5af3107a4000',
      data: '0x',
      nonce: 317,
      type: '2',
      gas: 21004n,
      maxFeePerGas: 291175227375n,
      maxPriorityFeePerGas: 81000000000n
    }

    const expectedSignableTransactionRequest: SignableTransactionRequest = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      nonce: 317,
      data: '0x',
      gas: 21004n,
      maxFeePerGas: 291175227375n,
      maxPriorityFeePerGas: 81000000000n,
      type: transactionType['0x2'],
      value: hexToBigInt('0x5af3107a4000')
    }

    const result = buildSignableTransactionRequest(transactionRequest)

    expect(result).toEqual(expectedSignableTransactionRequest)
  })

  it('builds a signable transaction request for legacy transaction type', () => {
    const transactionRequest: TransactionRequestLegacy = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      chainId: 137,
      value: '0x5af3107a4000',
      data: '0x',
      nonce: 317,
      type: '0',
      gas: 21004n,
      gasPrice: 1000000000n
    }

    const expectedSignableTransactionRequest: SignableTransactionRequest = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      nonce: 317,
      data: '0x',
      gas: 21004n,
      gasPrice: 1000000000n,
      type: transactionType['0x0'],
      value: hexToBigInt('0x5af3107a4000')
    }

    const result = buildSignableTransactionRequest(transactionRequest)

    expect(result).toEqual(expectedSignableTransactionRequest)
  })

  it('builds a transactionRequest with unknown type', () => {
    const transactionRequest: TransactionRequest = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      chainId: 137,
      value: '0x5af3107a4000',
      data: '0x',
      nonce: 317,
      gas: 21004n
    }

    const expectedSignableTransactionRequest: SignableTransactionRequest = {
      from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
      nonce: 317,
      data: '0x',
      gas: 21004n,
      type: transactionType['0x0'],
      value: hexToBigInt('0x5af3107a4000')
    }

    const result = buildSignableTransactionRequest(transactionRequest)

    expect(result).toEqual(expectedSignableTransactionRequest)
  })
})

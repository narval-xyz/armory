// builders.test.ts
import {
  Eip712TypedData,
  TransactionRequest
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import { buildRequest } from '../request-builder'

const validTransactionRequest: TransactionRequest = {
  from: '0x323b5d4c32345ced77393b3530b1eed0f346429d',
  to: '0x111b5d4c32345ced77393b3530b1eed0f346429d',
  value: '0x00',
  data: '0xa9059cbb000000000000000000000000b10c1848e5df57d25e2e213ecb3da813338d7e490000000000000000000000000000000000000000000000000000000000000064',
  chainId: 1
}

describe('buildRequest', () => {
  it('builds a sign transaction request correctly', () => {
    const nonce = v4()
    const resourceId = 'resource-id'
    const result = buildRequest('wallet')
      .setAction('signTransaction')
      .setNonce(nonce)
      .setResourceId(resourceId)
      .setTransactionRequest(validTransactionRequest)
      .build()
    expect(result.success).toBe(true)
  })

  it('builds a sign raw request correctly', () => {
    const nonce = v4()
    const resourceId = 'resource-id'
    const rawMessage = '0x1222'
    const alg = 'ES256'

    const result = buildRequest('wallet')
      .setAction('signRaw')
      .setNonce(nonce)
      .setResourceId(resourceId)
      .setRawMessage(rawMessage)
      .setAlg(alg)
      .build()

    expect(result.success).toBe(true)
  })

  it('builds a sign message request correctly', () => {
    const nonce = v4()
    const resourceId = 'resource-id'
    const message = 'Hello, World!'

    const result = buildRequest('wallet')
      .setAction('signMessage')
      .setNonce(nonce)
      .setResourceId(resourceId)
      .setMessage(message)
      .build()

    expect(result.success).toBe(true)
  })

  it('builds a sign typed data request correctly', () => {
    const nonce = v4()
    const resourceId = 'resource-id'
    const typedData: Eip712TypedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ]
      },
      primaryType: 'Person',
      domain: {
        name: 'MyAmazingDapp',
        version: '1.0',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      message: {
        name: 'John Doe',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
      }
    }

    const result = buildRequest('wallet')
      .setAction('signTypedData')
      .setNonce(nonce)
      .setResourceId(resourceId)
      .setTypedData(typedData)
      .build()

    expect(result.success).toBe(true)
  })

  it('fails gracefully when required fields are missing', () => {
    const buildAttempt = buildRequest('wallet').setAction('signTransaction').build()
    expect(buildAttempt.success).toEqual(false)
  })

  it('fails gracefully when transaction request data is invalid', () => {
    const invalidTransactionDetails = { from: '0xInvalid', value: 'notANumber', data: '0xData' } // Intentionally invalid structure

    const buildAttempt = buildRequest('wallet')
      .setAction('signTransaction')
      .setNonce(v4())
      .setResourceId('resource-id')
      .setTransactionRequest(invalidTransactionDetails as unknown as TransactionRequest) // Force incorrect type for testing
      .build()

    expect(buildAttempt.success).toEqual(false)
  })

  it('ensures nonce is properly generated or set', () => {
    const resourceId = 'resource-id'

    const resultWithNonce = buildRequest('wallet')
      .setAction('signTransaction')
      .setNonce('123')
      .setResourceId(resourceId)
      .setTransactionRequest(validTransactionRequest)
      .build()

    expect(resultWithNonce.success).toEqual(true)

    const resultAutoNonce = buildRequest('wallet')
      .setAction('signTransaction')
      .setResourceId(resourceId)
      .setTransactionRequest(validTransactionRequest)
      .build()

    expect(resultAutoNonce.success).toEqual(true)
  })

  it('invalidate fake typed data structure', () => {
    const invalidTypedData = {}

    const buildAttempt = buildRequest('wallet')
      .setAction('signTypedData')
      .setNonce(v4())
      .setResourceId('resource-id')
      .setTypedData(invalidTypedData as unknown as Eip712TypedData) // Force incorrect type for testing
      .build()

    expect(buildAttempt.success).toEqual(false)
  })
})

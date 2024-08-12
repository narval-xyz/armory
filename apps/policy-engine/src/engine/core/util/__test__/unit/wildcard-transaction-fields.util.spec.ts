import {
  Action,
  Request,
  TransactionRequest,
  TransactionRequestEIP1559,
  TransactionRequestLegacy
} from '@narval/policy-engine-shared'
import {
  Type0WildcarableFields,
  Type2WildcarableFields,
  WildcardableFields,
  buildTransactionRequestHashWildcard,
  findType0UndefinedWildcardableFields,
  findType2UndefinedWildcardableFields,
  findUndefinedWildcardableFields
} from '../../wildcard-transaction-fields.util'

describe('findUndefinedWildcardableFields', () => {
  it('returns the correct undefined wildcardable fields for type 0 transaction', () => {
    const transaction: TransactionRequestLegacy = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      gasPrice: undefined,
      type: '0'
    }
    expect(findType0UndefinedWildcardableFields(transaction)).toEqual([Type0WildcarableFields.GAS_PRICE])
  })

  it('returns an empty array if no undefined wildcardable fields for type 0 transaction', () => {
    const transaction: TransactionRequestLegacy = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      gasPrice: 100n,
      type: '0'
    }
    expect(findType0UndefinedWildcardableFields(transaction)).toEqual([])
  })

  it('returns the correct undefined wildcardable fields for type 2 transaction', () => {
    const transaction: TransactionRequestEIP1559 = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      maxFeePerGas: undefined,
      type: '2'
    }
    expect(findType2UndefinedWildcardableFields(transaction)).toEqual([
      Type2WildcarableFields.MAX_FEE_PER_GAS,
      Type2WildcarableFields.MAX_PRIORITY_FEE_PER_GAS
    ])
  })

  it("returns all wildcardable fields if transaction doesn't have a type", () => {
    const transaction: TransactionRequest = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      gas: undefined,
      nonce: undefined
    }
    expect(findUndefinedWildcardableFields(transaction).sort()).toEqual(Object.values(WildcardableFields).sort())
  })

  it('returns only undefined or absent fields', () => {
    const transaction: TransactionRequest = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      maxFeePerGas: 100n,
      maxPriorityFeePerGas: 100n,
      nonce: 0
    }
    expect(findUndefinedWildcardableFields(transaction)).toEqual([WildcardableFields.GAS, WildcardableFields.GAS_PRICE])
  })
})

describe('buildTransactionRequestHashWildcard', () => {
  it('returns missing fields as wildcard and path prefixed', () => {
    const transaction: TransactionRequest = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      gas: undefined,
      nonce: undefined
    }

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: '123',
      transactionRequest: transaction,
      resourceId: 'eip155:eoa:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e'
    }

    expect(buildTransactionRequestHashWildcard(request)).toEqual([
      'transactionRequest.gas',
      'transactionRequest.nonce',
      'transactionRequest.gasPrice',
      'transactionRequest.maxFeePerGas',
      'transactionRequest.maxPriorityFeePerGas'
    ])
  })
})

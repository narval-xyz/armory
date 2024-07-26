import { Action } from '@narval/policy-engine-shared'
import { AuthorizationRequestStatus } from '@prisma/client/armory'
import { decodeAuthorizationRequest } from '../../../../persistence/decode/authorization-request.decode'
import { DecodeAuthorizationRequestException } from '../../../../persistence/exception/decode-authorization-request.exception'
import { AuthorizationRequestModel } from '../../../../persistence/type/model.type'

describe('decodeAuthorizationRequest', () => {
  const sharedModel: Omit<AuthorizationRequestModel, 'action' | 'request'> = {
    id: '3356d68c-bc63-4b08-9253-289eec475d1d',
    clientId: 'f6477ee7-7f5e-4e19-92f9-7864c7af5fd4',
    status: AuthorizationRequestStatus.CREATED,
    idempotencyKey: null,
    authnSig:
      '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c',
    evaluationLog: [],
    approvals: [],
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('sign transaction', () => {
    it('decodes a sign transaction authorization request successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_TRANSACTION,
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          transactionRequest: {
            from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
            chainId: 1,
            nonce: 1
          }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })

    it('throws DecodeAuthorizationRequestException when decoder fails', () => {
      const invalidModel = {
        ...sharedModel,
        action: Action.SIGN_TRANSACTION,
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          transactionRequest: {
            from: 'not-an-ethereum-address',
            gas: '5000'
          }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })
  })

  describe('sign message', () => {
    it('decodes request successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_MESSAGE,
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          message: 'Test messsage'
        }
      }

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })

    it('throws DecodeAuthorizationRequestException when decoder fails', () => {
      const invalidModel = {
        ...sharedModel,
        action: Action.SIGN_MESSAGE,
        request: {}
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })

    it('decodes a raw message successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_MESSAGE,
        request: {
          action: Action.SIGN_MESSAGE,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          message: { raw: '0xdeadbeef' }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })
  })

  describe('sign typed data', () => {
    it('decodes a sign typed data authorization request with serialized message successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_TYPED_DATA,
        request: {
          action: Action.SIGN_TYPED_DATA,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          typedData: {
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
              name: 'Ether Mail',
              version: '1',
              chainId: 1,
              verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
            },
            message: JSON.stringify({ name: 'Bob', wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' })
          }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })

    it('decodes a sign typed data authorization request with a string chainId successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_TYPED_DATA,
        request: {
          action: Action.SIGN_TYPED_DATA,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          typedData: {
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
              name: 'Ether Mail',
              version: '1',
              chainId: '1',
              verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
            },
            message: JSON.stringify({ name: 'Bob', wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' })
          }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })

    it('throws DecodeAuthorizationRequestException if message string is not a valid json', () => {
      const invalidModel = {
        ...sharedModel,
        action: Action.SIGN_TYPED_DATA,
        request: {
          action: Action.SIGN_TYPED_DATA,
          nonce: '99',
          resourceId: '440b486a-8807-49d8-97a1-24c2920730ed',
          typedData: {
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
              name: 'Ether Mail',
              version: '1',
              chainId: 1,
              verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
            },
            message: 'not-a-valid-json'
          }
        }
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })
  })
})

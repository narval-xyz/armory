import { SupportedAction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { decodeAuthorizationRequest } from '@app/orchestration/policy-engine/persistence/decode/authorization-request.decode'
import { DecodeAuthorizationRequestException } from '@app/orchestration/policy-engine/persistence/exception/decode-authorization-request.exception'
import { AuthorizationRequestAction, AuthorizationRequestStatus } from '@prisma/client/orchestration'

describe('decodeAuthorizationRequest', () => {
  const sharedModel = {
    id: '3356d68c-bc63-4b08-9253-289eec475d1d',
    orgId: 'f6477ee7-7f5e-4e19-92f9-7864c7af5fd4',
    status: AuthorizationRequestStatus.CREATED,
    hash: 'test-request-hash',
    idempotencyKey: null,
    authnSig:
      '0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c',
    authnAlg: 'ES256K',
    authnPubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890',
    evaluationLog: [],
    approvals: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('sign transaction', () => {
    it('decodes a sign transaction authorization request successfully', () => {
      const validModel = {
        ...sharedModel,
        action: SupportedAction.SIGN_TRANSACTION,
        request: {
          from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
          chainId: 1,
          nonce: 1
        }
      }

      AuthorizationRequestAction

      expect(() => {
        decodeAuthorizationRequest(validModel)
      }).not.toThrow(DecodeAuthorizationRequestException)
    })

    it('throws DecodeAuthorizationRequestException when decoder fails', () => {
      const invalidModel = {
        ...sharedModel,
        action: SupportedAction.SIGN_TRANSACTION,
        request: {
          from: 'not-an-ethereum-address',
          gas: '5000'
        }
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })

    it.skip('throws DecodeAuthorizationRequestException when null/undefined coerces to bigint error', () => {
      const requestWithGasNull = {
        from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
        to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
        data: '0x',
        gas: null
      }
      const model = {
        ...sharedModel,
        action: SupportedAction.SIGN_TRANSACTION
      }

      expect(() => {
        decodeAuthorizationRequest({ ...model, request: requestWithGasNull })
      }).toThrow(DecodeAuthorizationRequestException)

      expect(() => {
        decodeAuthorizationRequest({ ...model, request: { ...requestWithGasNull, gas: undefined } })
      }).toThrow(DecodeAuthorizationRequestException)
    })
  })

  describe('sign message', () => {
    it('decodes request successfully', () => {
      const validModel = {
        ...sharedModel,
        action: SupportedAction.SIGN_MESSAGE,
        request: {
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
        action: SupportedAction.SIGN_MESSAGE,
        request: {}
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })
  })
})

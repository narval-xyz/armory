import { Action } from '@app/orchestration/policy-engine/core/type/domain.type'
import { decodeAuthorizationRequest } from '@app/orchestration/policy-engine/persistence/decode/authorization-request.decode'
import { DecodeAuthorizationRequestException } from '@app/orchestration/policy-engine/persistence/exception/decode-authorization-request.exception'
import { AuthorizationRequestStatus } from '@prisma/client/orchestration'

describe('decodeAuthorizationRequest', () => {
  const sharedModel = {
    id: '3356d68c-bc63-4b08-9253-289eec475d1d',
    orgId: 'f6477ee7-7f5e-4e19-92f9-7864c7af5fd4',
    initiatorId: 'alice',
    status: AuthorizationRequestStatus.CREATED,
    hash: 'test-request-hash',
    idempotencyKey: null,
    evaluationLog: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('sign transaction', () => {
    it('decodes a sign transaction authorization request successfully', () => {
      const validModel = {
        ...sharedModel,
        action: Action.SIGN_TRANSACTION,
        request: {
          from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
          to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
          data: '0x',
          gas: '5000'
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
        action: Action.SIGN_TRANSACTION
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
        action: Action.SIGN_MESSAGE,
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
        action: Action.SIGN_MESSAGE,
        request: {}
      }

      expect(() => {
        decodeAuthorizationRequest(invalidModel)
      }).toThrow(DecodeAuthorizationRequestException)
    })
  })
})

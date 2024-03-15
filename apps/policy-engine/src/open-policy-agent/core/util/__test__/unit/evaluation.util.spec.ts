import { Action, EvaluationRequest, SignTransactionAction } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { InputType, decode } from '@narval/transaction-request-intent'
import { generateInboundEvaluationRequest } from '../../../../../shared/testing/evaluation.testing'
import { OpenPolicyAgentException } from '../../../exception/open-policy-agent.exception'
import { toInput } from '../../evaluation.util'

describe('toInput', () => {
  it('throws OpenPolicyAgentException when action is unsupported', () => {
    const evaluation: Partial<EvaluationRequest> = {
      request: {
        action: Action.SIGN_TYPED_DATA,
        nonce: 'test-nonce',
        resourceId: 'test-resource-id',
        typedData: 'test-typed-data'
      }
    }

    expect(() => toInput(evaluation as EvaluationRequest)).toThrow(OpenPolicyAgentException)
  })

  describe(`when action is ${Action.SIGN_TRANSACTION}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateInboundEvaluationRequest()
    })

    it('maps the request action', () => {
      const input = toInput(evaluation)

      expect(input.action).toEqual(evaluation.request.action)
    })

    it('maps the transaction request', () => {
      const input = toInput(evaluation)
      const request = evaluation.request as SignTransactionAction

      expect(input.transactionRequest).toEqual(request.transactionRequest)
    })

    it('maps the transfers', () => {
      const input = toInput(evaluation)

      expect(input.transfers).toEqual(evaluation.transfers)
    })

    it('maps the principal', () => {
      const input = toInput(evaluation)

      expect(input.principal).toEqual({
        id: 'test-cred-id',
        pubKey: 'test-pub-key',
        address: 'test-address',
        alg: Alg.ES256K,
        userId: 'test-user-id'
      })
    })

    it('maps the approvals', () => {
      const input = toInput(evaluation)

      expect(input.approvals).toEqual([
        {
          id: 'test-cred-id',
          pubKey: 'test-pub-key',
          address: 'test-address',
          alg: Alg.ES256K,
          userId: 'test-user-id'
        }
      ])
    })

    it('adds the transaction request intent', () => {
      const input = toInput(evaluation)
      const intent = decode({
        input: {
          type: InputType.TRANSACTION_REQUEST,
          txRequest: (evaluation.request as SignTransactionAction).transactionRequest
        }
      })

      expect(input.intent).toEqual(intent)
    })
  })
})

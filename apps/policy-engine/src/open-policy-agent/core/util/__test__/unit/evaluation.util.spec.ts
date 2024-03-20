import { Action, EvaluationRequest, FIXTURE, SignTransactionAction } from '@narval/policy-engine-shared'
import { InputType, decode } from '@narval/transaction-request-intent'
import { generateInboundEvaluationRequest } from '../../../../../shared/testing/evaluation.testing'
import { OpenPolicyAgentException } from '../../../exception/open-policy-agent.exception'
import { toData, toInput } from '../../evaluation.util'

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

describe('toData', () => {
  describe('entities', () => {
    it('indexes address book accounts by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const firstAccount = FIXTURE.ADDRESS_BOOK[0]

      expect(entities.addressBook[firstAccount.id]).toEqual(firstAccount)
    })

    it('indexes tokens by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const usdc = FIXTURE.TOKEN.usdc1

      expect(entities.tokens[usdc.id]).toEqual(usdc)
    })

    it('indexes users by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const alice = FIXTURE.USER.Alice

      expect(entities.users[alice.id]).toEqual(alice)
    })

    it('indexes wallets by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const wallet = FIXTURE.WALLET.Testing

      expect(entities.wallets[wallet.id]).toEqual(wallet)
    })

    it('indexes user groups with members by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.USER_GROUP.Engineering

      expect(entities.userGroups[group.id]).toEqual({
        id: group.id,
        users: FIXTURE.USER_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ userId }) => userId)
      })
    })

    it('indexes wallet groups with members by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.WALLET_GROUP.Treasury

      expect(entities.walletGroups[group.id]).toEqual({
        id: group.id,
        wallets: FIXTURE.WALLET_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(
          ({ walletId }) => walletId
        )
      })
    })
  })
})

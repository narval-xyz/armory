import {
  Action,
  EvaluationRequest,
  FIXTURE,
  GrantPermissionAction,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { InputType, decode } from '@narval/transaction-request-intent'
import {
  generateGrantPermissionRequest,
  generateSignMessageRequest,
  generateSignRawRequest,
  generateSignTransactionRequest,
  generateSignTypedDataRequest
} from '../../../../../shared/testing/evaluation.testing'
import { OpenPolicyAgentException } from '../../../exception/open-policy-agent.exception'
import { toData, toInput } from '../../evaluation.util'

describe('toInput', () => {
  const principal = FIXTURE.CREDENTIAL.Alice
  const approvals = [FIXTURE.CREDENTIAL.Alice, FIXTURE.CREDENTIAL.Bob, FIXTURE.CREDENTIAL.Carol]

  it('throws OpenPolicyAgentException when action is unsupported', async () => {
    const evaluation = await generateSignTransactionRequest()
    const unsupportedEvaluationRequest = {
      ...evaluation,
      request: {
        ...evaluation.request,
        action: 'UNSUPPORTED ACTION'
      }
    }

    expect(() =>
      toInput({ evaluation: unsupportedEvaluationRequest as EvaluationRequest, principal, approvals })
    ).toThrow(OpenPolicyAgentException)
    expect(() =>
      toInput({ evaluation: unsupportedEvaluationRequest as EvaluationRequest, principal, approvals })
    ).toThrow('Unsupported evaluation request action')
  })

  describe(`when action is ${Action.SIGN_TRANSACTION}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateSignTransactionRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.SIGN_TRANSACTION)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.resource).toEqual({ uid: request.resourceId })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })

    it('maps transaction request', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.transactionRequest).toEqual(request.transactionRequest)
    })

    it('adds decoded intent', () => {
      const input = toInput({ evaluation, principal, approvals })
      const intent = decode({
        input: {
          type: InputType.TRANSACTION_REQUEST,
          txRequest: (evaluation.request as SignTransactionAction).transactionRequest
        }
      })

      expect(input.intent).toEqual(intent)
    })
  })

  describe(`when action is ${Action.SIGN_TYPED_DATA}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateSignTypedDataRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.SIGN_TYPED_DATA)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.resource).toEqual({ uid: request.resourceId })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })

    it('adds decoded intent', () => {
      const input = toInput({ evaluation, principal, approvals })
      const intent = decode({
        input: {
          type: InputType.TYPED_DATA,
          typedData: (evaluation.request as SignTypedDataAction).typedData
        }
      })

      expect(input.intent).toEqual(intent)
    })
  })

  describe(`when action is ${Action.SIGN_MESSAGE}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateSignMessageRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.SIGN_MESSAGE)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignMessageAction

      expect(input.resource).toEqual({ uid: request.resourceId })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })
  })

  describe(`when action is ${Action.SIGN_RAW}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateSignRawRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.SIGN_RAW)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignRawAction

      expect(input.resource).toEqual({ uid: request.resourceId })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })
  })

  describe(`when action is ${Action.GRANT_PERMISSION}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateGrantPermissionRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.GRANT_PERMISSION)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as GrantPermissionAction

      expect(input.resource).toEqual({ uid: request.resourceId })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })

    it('maps permissions', async () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as GrantPermissionAction

      expect(input.permissions).toEqual(request.permissions)
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

    it('indexes accounts by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const account = FIXTURE.WALLET.Testing

      expect(entities.accounts[account.id]).toEqual(account)
    })

    it('indexes user groups with members by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.USER_GROUP.Engineering

      expect(entities.userGroups[group.id]).toEqual({
        id: group.id,
        users: FIXTURE.USER_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ userId }) => userId)
      })
    })

    it('indexes account groups with members by id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.WALLET_GROUP.Treasury

      expect(entities.accountGroups[group.id]).toEqual({
        id: group.id,
        accounts: FIXTURE.WALLET_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(
          ({ accountId }) => accountId
        )
      })
    })
  })
})

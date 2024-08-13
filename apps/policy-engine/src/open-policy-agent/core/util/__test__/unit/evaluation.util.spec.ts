import {
  Action,
  EvaluationRequest,
  FIXTURE,
  GrantPermissionAction,
  SerializedUserOperationV6,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction
} from '@narval/policy-engine-shared'
import { InputType, decode } from '@narval/transaction-request-intent'
import {
  generateGrantPermissionRequest,
  generateSignMessageRequest,
  generateSignRawRequest,
  generateSignTransactionRequest,
  generateSignTypedDataRequest,
  generateSignUserOperationRequest
} from '../../../../../shared/testing/evaluation.testing'
import { OpenPolicyAgentException } from '../../../exception/open-policy-agent.exception'
import { lowercaseInputInvariant, toData, toInput } from '../../evaluation.util'

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

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })

    it('maps transaction request with lowercased to and from', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.transactionRequest).toEqual({
        ...request.transactionRequest,
        from: request.transactionRequest.from.toLowerCase(),
        to: request.transactionRequest.to?.toLowerCase() || undefined
      })
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

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignTransactionAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
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

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignMessageAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
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

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignRawAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
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

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as GrantPermissionAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
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

  describe(`when action is ${Action.SIGN_USER_OPERATION}`, () => {
    let evaluation: EvaluationRequest

    beforeEach(async () => {
      evaluation = await generateSignUserOperationRequest()
    })

    it('maps action', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.action).toEqual(Action.SIGN_USER_OPERATION)
    })

    it('maps principal', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal).toEqual(principal)
    })

    it('maps resource uid to lower case', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignUserOperationAction

      expect(input.resource).toEqual({ uid: request.resourceId.toLowerCase() })
    })

    it('maps approvals', () => {
      const input = toInput({ evaluation, principal, approvals })

      expect(input.approvals).toEqual(approvals)
    })

    it('maps user operation', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignUserOperationAction

      expect(input.userOperation).toEqual(SerializedUserOperationV6.parse(request.userOperation))
    })
  })
})

describe('toData', () => {
  describe('entities', () => {
    const lowerCaseId = <T extends { id: string }>(value: T) => ({ ...value, id: value.id.toLowerCase() })

    it('indexes address book accounts by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const firstAccount = FIXTURE.ADDRESS_BOOK[0]

      expect(entities.addressBook[firstAccount.id.toLowerCase()]).toEqual(lowerCaseId(firstAccount))
    })

    it('indexes tokens by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const usdc = FIXTURE.TOKEN.usdc1

      expect(entities.tokens[usdc.id.toLowerCase()]).toEqual(usdc)
    })

    it('indexes users by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const alice = FIXTURE.USER.Alice

      expect(entities.users[alice.id.toLowerCase()]).toEqual(alice)
    })

    it('indexes accounts by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const account = FIXTURE.ACCOUNT.Testing

      expect(entities.accounts[account.id.toLowerCase()]).toEqual({
        ...lowerCaseId(account),
        assignees: ['test-alice-user-uid']
      })
    })

    it('indexes user groups with members by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.USER_GROUP.Engineering

      expect(entities.userGroups[group.id.toLowerCase()]).toEqual({
        id: group.id.toLowerCase(),
        users: FIXTURE.USER_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ userId }) =>
          userId.toLowerCase()
        )
      })
    })

    it('indexes account groups with members by lower case id', () => {
      const { entities } = toData(FIXTURE.ENTITIES)
      const group = FIXTURE.ACCOUNT_GROUP.Treasury

      expect(entities.accountGroups[group.id.toLowerCase()]).toEqual({
        id: group.id.toLowerCase(),
        accounts: FIXTURE.ACCOUNT_GROUP_MEMBER.filter(({ groupId }) => groupId === group.id).map(({ accountId }) =>
          accountId.toLowerCase()
        )
      })
    })
  })
})

describe('lowercaseInputInvariant', () => {
  it('lowercases principal', async () => {
    const principal = FIXTURE.CREDENTIAL.Alice
    const preparedInput = lowercaseInputInvariant({
      evaluation: await generateSignTransactionRequest(),
      principal,
      approvals: []
    })

    expect(preparedInput.principal.id).toEqual(principal.id.toLowerCase())
  })

  it('lowercases approvals.id', async () => {
    const approvals = [FIXTURE.CREDENTIAL.Alice, FIXTURE.CREDENTIAL.Bob, FIXTURE.CREDENTIAL.Carol]
    const preparedInput = lowercaseInputInvariant({
      evaluation: await generateSignTransactionRequest(),
      principal: FIXTURE.CREDENTIAL.Alice,
      approvals
    })

    approvals.map((approval) => {
      expect(preparedInput.approvals?.find((a) => a.id === approval.id.toLowerCase())).toBeDefined()
    })
  })

  it("lowercases transactionRequest's addresses in signTransaction action", async () => {
    const evaluation = await generateSignTransactionRequest()
    const preparedInput = lowercaseInputInvariant({ evaluation, principal: FIXTURE.CREDENTIAL.Alice, approvals: [] })
    const request = evaluation.request as SignTransactionAction

    expect((preparedInput.evaluation.request as SignTransactionAction).transactionRequest.from).toEqual(
      request.transactionRequest.from.toLowerCase()
    )
    expect((preparedInput.evaluation.request as SignTransactionAction).transactionRequest.to).toEqual(
      request.transactionRequest.to?.toLowerCase()
    )
  })

  it('lowercases resource', async () => {
    const evaluation = await generateSignTransactionRequest()
    const preparedInput = lowercaseInputInvariant({ evaluation, principal: FIXTURE.CREDENTIAL.Alice, approvals: [] })
    const request = evaluation.request as SignTransactionAction

    expect(preparedInput.evaluation.request.resourceId).toEqual(request.resourceId.toLowerCase())
  })

  it("doesn't add transactionRequest to input if action is not signTransaction", async () => {
    const evaluation = await generateSignMessageRequest()
    const preparedInput = lowercaseInputInvariant({ evaluation, principal: FIXTURE.CREDENTIAL.Alice, approvals: [] })

    expect(preparedInput.evaluation.request).not.toHaveProperty('transactionRequest')
  })

  it('lowercases addresses in signUserOperation request', async () => {
    const evaluation = await generateSignUserOperationRequest()
    const preparedInput = lowercaseInputInvariant({ evaluation, principal: FIXTURE.CREDENTIAL.Alice, approvals: [] })
    const request = evaluation.request as SignUserOperationAction

    expect((preparedInput.evaluation.request as SignUserOperationAction).userOperation.sender).toEqual(
      request.userOperation.sender.toLowerCase()
    )
    expect((preparedInput.evaluation.request as SignUserOperationAction).userOperation.factoryAddress).toEqual(
      request.userOperation.factoryAddress.toLowerCase()
    )
    expect((preparedInput.evaluation.request as SignUserOperationAction).userOperation.entryPoint).toEqual(
      request.userOperation.entryPoint.toLowerCase()
    )
  })

  it('lowercases verifyingContract in signTypedData request', async () => {
    const evaluation = await generateSignTypedDataRequest()
    const preparedInput = lowercaseInputInvariant({ evaluation, principal: FIXTURE.CREDENTIAL.Alice, approvals: [] })
    const request = evaluation.request as SignTypedDataAction

    expect((preparedInput.evaluation.request as SignTypedDataAction).typedData.domain.verifyingContract).toEqual(
      request.typedData?.domain?.verifyingContract?.toLowerCase()
    )
  })
})

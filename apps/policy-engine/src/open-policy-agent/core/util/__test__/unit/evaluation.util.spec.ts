import {
  Action,
  EvaluationRequest,
  FIXTURE_V2,
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
import { toInput } from '../../evaluation.util'

describe('toInput', () => {
  const principal = FIXTURE_V2.CREDENTIAL.Alice
  const approvals = [FIXTURE_V2.CREDENTIAL.Alice, FIXTURE_V2.CREDENTIAL.Bob, FIXTURE_V2.CREDENTIAL.Carol]

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

    it('lowercases principal', () => {
      const principal = {
        id: 'NoTLowerCasedId',
        userId: 'NotLOWECasedId',
        key: FIXTURE_V2.CREDENTIAL.Alice.key
      }
      const input = toInput({ evaluation, principal, approvals })

      expect(input.principal.id).toEqual(principal.id.toLowerCase())
      expect(input.principal.userId).toEqual(principal.userId.toLowerCase())
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

    it('maps user operation with lowercased addresses', () => {
      const input = toInput({ evaluation, principal, approvals })
      const request = evaluation.request as SignUserOperationAction

      expect(input.userOperation).toEqual(
        SerializedUserOperationV6.parse({
          ...request.userOperation,
          sender: request.userOperation.sender.toLowerCase(),
          entryPoint: request.userOperation.entryPoint.toLowerCase(),
          factoryAddress: request.userOperation.factoryAddress.toLowerCase()
        })
      )
    })
  })
})


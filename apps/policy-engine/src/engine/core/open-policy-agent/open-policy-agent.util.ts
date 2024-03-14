import { Action, EvaluationRequest } from '@narval/policy-engine-shared'
import { Alg } from '@narval/signature'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { OpenPolicyAgentException } from './open-policy-agent.exception'
import { Input } from './open-policy-agent.type'

// export const toData = (entities: Entities) => {}

export const toInput = (evaluation: EvaluationRequest): Input => {
  const { action } = evaluation.request

  if (action === Action.SIGN_TRANSACTION) {
    const result = safeDecode({
      input: {
        type: InputType.TRANSACTION_REQUEST,
        txRequest: evaluation.request.transactionRequest
      }
    })

    if (result.success) {
      return {
        action,
        intent: result.intent,
        transactionRequest: evaluation.request.transactionRequest,
        principal: {
          id: 'test-cred-id',
          pubKey: 'test-pub-key',
          address: 'test-address',
          alg: Alg.ES256K,
          userId: 'test-user-id'
        },
        approvals: [
          {
            id: 'test-cred-id',
            pubKey: 'test-pub-key',
            address: 'test-address',
            alg: Alg.ES256K,
            userId: 'test-user-id'
          }
        ],
        transfers: evaluation.transfers
      }
    }

    throw new OpenPolicyAgentException({
      message: 'Invalid transaction request intent',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: {
        error: result.error,
        txRequest: evaluation.request.transactionRequest
      }
    })
  }

  throw new OpenPolicyAgentException({
    message: 'Unsupported evaluation request action',
    suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    context: { action }
  })
}

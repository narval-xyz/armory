import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Actions } from './enums'
import { ApprovalRequirement, TransactionRequest } from './http'

export type RegoInput = {
  activityType: Actions
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: {
    uid: string
  }
  resource: {
    uid?: string // eg. walletId; could be null for actions such "Create User"
  }
  signatures: { signer: string }[] // TODO: rename this to `approvals: ApprovalSignature[]`
}

type EvaluationReason = {
  policyId: string
  approvalsSatisfied: ApprovalRequirement[]
  approvalsMissing: ApprovalRequirement[]
}

export type OpaResult = {
  result: {
    reasons: EvaluationReason[]
    confirms?: [] // TODO: ???
    permit: boolean
  }
}

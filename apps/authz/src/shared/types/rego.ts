import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Action } from './enums'
import { ApprovalRequirement, AuthCredential, HistoricalTransfer, TransactionRequest } from './http'

export type RegoInput = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: { uid: string }
  resource?: { uid: string }
  approvals: AuthCredential[]
  transfers?: HistoricalTransfer[]
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

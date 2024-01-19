import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Action, ApprovalRequirement, AuthCredential, HistoricalTransfer, TransactionRequest } from './domain.type'

export type RegoInput = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: AuthCredential
  resource?: { uid: string }
  approvals: AuthCredential[]
  transfers?: HistoricalTransfer[]
}

type MatchedRule = {
  policyId: string
  type: 'permit' | 'forbid'
  decision: 'permit' | 'forbid'
  approvalsSatisfied: ApprovalRequirement[]
  approvalsMissing: ApprovalRequirement[]
}

export type OpaResult = {
  decision: 'permit' | 'forbid'
  reasons: MatchedRule[]
}

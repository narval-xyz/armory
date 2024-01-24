import { Action, ApprovalRequirement, HistoricalTransfer, TransactionRequest } from '@narval/authz-shared'
import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { AuthCredential } from './domain.type'

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
  approvalsSatisfied: ApprovalRequirement[]
  approvalsMissing: ApprovalRequirement[]
}

export type OpaResult = {
  default?: boolean
  permit: boolean
  reasons: MatchedRule[]
}

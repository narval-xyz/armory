import {
  Action,
  ApprovalRequirement,
  CredentialEntity,
  HistoricalTransfer,
  TransactionRequest
} from '@narval/policy-engine-shared'
import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'

export type RegoInput = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: CredentialEntity
  resource?: { uid: string }
  approvals: CredentialEntity[]
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

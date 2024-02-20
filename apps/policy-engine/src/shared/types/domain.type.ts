import {
  Action,
  ApprovalRequirement,
  CredentialEntity,
  HistoricalTransfer,
  TransactionRequest
} from '@narval/authz-shared'
import { Intent } from '@narval/transaction-request-intent'

export enum UserRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  MEMBER = 'member',
  MANAGER = 'manager'
}

export type RegoInput = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: CredentialEntity
  resource?: { uid: string }
  approvals: CredentialEntity[]
  transfers?: HistoricalTransfer[]
}

export type MatchedRule = {
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

export type VerifiedApproval = {
  signature: string
  userId: string
  credentialId: string // The credential used for this approval
  address?: string // Address, if the Credential is a EOA private key TODO: Do we need this?
}

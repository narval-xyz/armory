import { Action, CredentialEntity, HistoricalTransfer, TransactionRequest } from '@narval/policy-engine-shared'
import { Intent } from '@narval/transaction-request-intent'

export type Input = {
  action: Action
  intent?: Intent
  transactionRequest?: TransactionRequest
  principal: CredentialEntity
  resource?: { uid: string }
  // TODO: Why is this a credential?
  approvals: CredentialEntity[]
  transfers?: HistoricalTransfer[]
}

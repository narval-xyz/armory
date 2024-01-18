import { Caip10 } from 'packages/transaction-request-intent/src/lib/caip'
import { Intent } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Action } from './enums'
import { ApprovalRequirement, AuthCredential, TransactionRequest } from './http'

export enum FiatSymbols {
  USD = 'fiat:usd',
  EUR = 'fiat:eur'
}

export type HistoricalTransfer = {
  amount: string // Amount in the smallest unit of the token (eg. wei for ETH)
  from: Caip10
  to: Caip10 // In case we want spending limit per destination address
  chainId: number
  token: Caip10
  rates: { [keyof in FiatSymbols]: string } // eg. { fiat:usd: '0.01', fiat:eur: '0.02' }
  initiatedBy: string // uid of the user who initiated the spending
  timestamp: number // unix timestamp
}

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

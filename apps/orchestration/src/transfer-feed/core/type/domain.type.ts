import { SetOptional } from 'type-fest'

export type Rates = Record<string, number>

export type Transfer = {
  id: string
  orgId: string
  amount: bigint
  from: string
  to: string
  chainId: number
  token: string
  rates: Rates
  initiatedBy: string
  createdAt: Date
}

export type CreateTransfer = SetOptional<Transfer, 'id' | 'createdAt'>

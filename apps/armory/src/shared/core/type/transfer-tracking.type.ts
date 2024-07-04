import { SetOptional } from 'type-fest'
import { Price } from './price.type'

export type Transfer = {
  id: string
  resourceId: string
  clientId: string
  requestId: string
  amount: bigint
  from: string
  to: string
  chainId: number
  token: string
  rates: Price
  initiatedBy: string
  createdAt: Date
}

export type CreateTransfer = SetOptional<Transfer, 'id' | 'createdAt'>

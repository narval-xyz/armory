import { Price } from '@app/orchestration/shared/core/type/price.type'
import { SetOptional } from 'type-fest'

export type Transfer = {
  id: string
  orgId: string
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

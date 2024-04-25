// src/models.ts

import { UserRole } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { Hex } from 'viem'

export type User = {
  id: string
  name: string
  role: UserRole
  credential: Jwk
  privateKey?: Hex
  walletIds: string[]
}

export type Wallet = {
  id: string
  name: string
  key: Hex
  userIds: string[]
}

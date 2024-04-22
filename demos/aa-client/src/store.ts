import { Entities, EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { User, Wallet } from './models'

export const users = new Map<string, User>([['matt', { id: 'matt', name: 'Matt', walletIds: [], credential: {} }]])
export const wallets = new Map<string, Wallet>()
export const policies = new Map<string, PolicyStore>([['default', { data: [], signature: '' }]])
export const entities = new Map<string, EntityStore>([['default', { data: {} as Entities, signature: '' }]])

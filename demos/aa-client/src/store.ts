import { EntityStore, PolicyStore } from '@narval-xyz/policy-engine-domain'
import { User, Wallet } from './models'

export const users = new Map<string, User>()
export const wallets = new Map<string, Wallet>()
export const policies = new Map<string, PolicyStore>()
export const entities = new Map<string, EntityStore>()

import { SetRequired } from 'type-fest'
import { SyncContext } from '../type/provider.type'

export const buildEmptyContext = ({
  connection,
  wallets,
  accounts,
  addresses,
  now
}: SetRequired<Partial<SyncContext>, 'connection'>): SyncContext => ({
  connection,
  wallets: wallets || [],
  accounts: accounts || [],
  addresses: addresses || [],
  now: now || new Date()
})

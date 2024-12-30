import { SetRequired } from 'type-fest'
import { SyncContext } from '../type/provider.type'

export const buildEmptyContext = ({
  connection,
  wallets,
  accounts,
  addresses,
  knownDestinations,
  now
}: SetRequired<Partial<SyncContext>, 'connection'>): SyncContext => ({
  connection,
  wallets: wallets || [],
  accounts: accounts || [],
  addresses: addresses || [],
  knownDestinations: knownDestinations || [],
  now: now || new Date()
})

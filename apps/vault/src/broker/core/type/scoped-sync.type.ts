import { z } from 'zod'
import { ConnectionWithCredentials } from './connection.type'
import { Account, Address, Wallet } from './indexed-resources.type'
import { NetworkMap } from './network.type'
import { Provider } from './provider.type'

export const RawAccount = z.object({
  provider: z.nativeEnum(Provider),
  externalId: z.string()
})
export type RawAccount = z.infer<typeof RawAccount>

export const ScopedSyncStatus = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial_success',
  FAILED: 'failed'
} as const
export type ScopedSyncStatus = (typeof ScopedSyncStatus)[keyof typeof ScopedSyncStatus]

export const RawAccountError = {
  EXTERNAL_RESOURCE_NOT_FOUND: 'EXTERNAL_RESOURCE_NOT_FOUND',
  UNLISTED_NETWORK: 'UNLISTED_NETWORK'
} as const
export type RawAccountError = (typeof RawAccountError)[keyof typeof RawAccountError]

export const RawAccountNetworkNotFoundFailure = z.object({
  code: z.literal(RawAccountError.UNLISTED_NETWORK),
  rawAccount: RawAccount,
  message: z.string(),
  networkId: z.string()
})
export type RawAccountNetworkNotFoundFailure = z.infer<typeof RawAccountNetworkNotFoundFailure>

export const RawAccountExternalResourceNotFoundFailure = z.object({
  code: z.literal(RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND),
  rawAccount: RawAccount,
  message: z.string(),
  externalResourceType: z.string(),
  externalResourceId: z.string()
})
export type RawAccountExternalResourceNotFoundFailure = z.infer<typeof RawAccountExternalResourceNotFoundFailure>

export const RawAccountSyncFailure = z.discriminatedUnion('code', [
  RawAccountNetworkNotFoundFailure,
  RawAccountExternalResourceNotFoundFailure
])
export type RawAccountSyncFailure = z.infer<typeof RawAccountSyncFailure>

export const ScopedSyncResult = z.object({
  wallets: z.array(Wallet),
  accounts: z.array(Account),
  addresses: z.array(Address),
  failures: z.array(RawAccountSyncFailure)
})
export type ScopedSyncResult = z.infer<typeof ScopedSyncResult>

export const ScopedSyncContext = z.object({
  connection: ConnectionWithCredentials,
  rawAccounts: z.array(RawAccount),
  networks: NetworkMap,
  existingAccounts: z.array(Account)
})
export type ScopedSyncContext = z.infer<typeof ScopedSyncContext>

export const ScopedSync = z.object({
  clientId: z.string(),
  completedAt: z.date().optional(),
  connectionId: z.string(),
  createdAt: z.date(),
  error: z
    .object({
      name: z.string().optional(),
      message: z.string().optional(),
      traceId: z.string().optional()
    })
    .optional(),
  status: z.nativeEnum(ScopedSyncStatus).default(ScopedSyncStatus.PROCESSING),
  scopedSyncId: z.string(),
  rawAccounts: z.array(RawAccount),
  failures: z.array(RawAccountSyncFailure).optional()
})
export type ScopedSync = z.infer<typeof ScopedSync>

export const StartScopedSync = z.object({
  clientId: z.string(),
  connectionId: z.string().describe('The connection to sync.'),
  rawAccounts: z.array(RawAccount).describe('The accounts to sync.')
})
export type StartScopedSync = z.infer<typeof StartScopedSync>

export const ScopedSyncStarted = z.object({
  started: z.boolean(),
  scopedSyncs: z.array(ScopedSync)
})
export type ScopedSyncStarted = z.infer<typeof ScopedSyncStarted>

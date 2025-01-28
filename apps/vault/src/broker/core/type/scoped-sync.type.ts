import { z } from 'zod'
import { Provider } from './provider.type'

export const RawAccount = z.object({
  provider: z.nativeEnum(Provider),
  externalId: z.string()
})
export type RawAccount = z.infer<typeof RawAccount>

export const ScopedSyncStatus = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const
export type ScopedSyncStatus = (typeof ScopedSyncStatus)[keyof typeof ScopedSyncStatus]

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
  rawAccounts: z.array(RawAccount)
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

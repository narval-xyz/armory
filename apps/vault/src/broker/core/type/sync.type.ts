import { z } from 'zod'

export const SyncStatus = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus]

export const Sync = z.object({
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
  status: z.nativeEnum(SyncStatus).default(SyncStatus.PROCESSING),
  syncId: z.string()
})
export type Sync = z.infer<typeof Sync>

export const StartSync = z.object({
  clientId: z.string(),
  connectionId: z
    .string()
    .describe('The connection to sync. If undefined, start the sync on all active connections')
    .optional()
})
export type StartSync = z.infer<typeof StartSync>

export const SyncStarted = z.object({
  started: z.boolean(),
  syncs: z.array(Sync)
})
export type SyncStarted = z.infer<typeof SyncStarted>

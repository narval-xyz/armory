import { hexSchema } from '@narval/policy-engine-shared'
import { ed25519PrivateKeySchema, ed25519PublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const AnchorageInputCredentials = z.object({
  apiKey: z.string(),
  privateKey: hexSchema.optional().describe('Ed25519 private key in hex format')
})
export type AnchorageInputCredentials = z.infer<typeof AnchorageInputCredentials>

export const AnchorageCredentials = z.object({
  apiKey: z.string().optional(),
  publicKey: ed25519PublicKeySchema,
  privateKey: ed25519PrivateKeySchema
})
export type AnchorageCredentials = z.infer<typeof AnchorageCredentials>

export const AnchorageResourceType = {
  VAULT: 'VAULT',
  WALLET: 'WALLET',
  ADDRESS: 'ADDRESS'
} as const
export type AnchorageResourceType = (typeof AnchorageResourceType)[keyof typeof AnchorageResourceType]

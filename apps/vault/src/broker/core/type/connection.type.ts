import { hexSchema } from '@narval/policy-engine-shared'
import { ed25519PrivateKeySchema, ed25519PublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const Provider = {
  ANCHORAGE: 'anchorage'
} as const
export type Provider = keyof typeof Provider

export const ConnectionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked'
} as const

const SharedConnection = z.object({
  id: z.string(),
  clientId: z.string(),
  provider: z.nativeEnum(Provider),
  url: z.string().url(),
  status: z.nativeEnum(ConnectionStatus).default(ConnectionStatus.ACTIVE),
  integrity: z.string(),
  label: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  revokedAt: z.date().optional()
})

export const AnchorageCredentials = z.object({
  // NOTE: The API key is optional in the initiation flow.
  apiKey: z.string().optional(),
  publicKey: ed25519PublicKeySchema,
  privateKey: ed25519PrivateKeySchema
})

const AnchorageConnection = SharedConnection.extend({
  provider: z.literal(Provider.ANCHORAGE),
  credentials: AnchorageCredentials
})

export const Connection = AnchorageConnection
export type Connection = z.infer<typeof Connection>

const SharedCreateConnection = z.object({
  connectionId: z.string().optional(),
  provider: z.nativeEnum(Provider),
  url: z.string().url(),
  label: z.string().optional(),
  createdAt: z.date().optional()
})

export const CreateConnection = SharedCreateConnection.extend({
  provider: z.literal(Provider.ANCHORAGE),
  credentials: z.object({
    apiKey: z.string(),
    // Ed25519, hex format
    privateKey: hexSchema.optional()
  })
})
export type CreateConnection = z.infer<typeof CreateConnection>

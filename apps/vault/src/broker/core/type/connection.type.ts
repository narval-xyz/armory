import { hexSchema } from '@narval/policy-engine-shared'
import { ed25519PrivateKeySchema, ed25519PublicKeySchema, rsaPublicKeySchema } from '@narval/signature'
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
  url: z.string().url().optional(),
  status: z.nativeEnum(ConnectionStatus).default(ConnectionStatus.ACTIVE),
  integrity: z.string(),
  label: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

export const Credentials = AnchorageCredentials
export type Credentials = z.infer<typeof Credentials>

const SharedPendingConnection = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  provider: z.nativeEnum(Provider),
  status: z.literal(ConnectionStatus.PENDING),
  encryptionPublicKey: rsaPublicKeySchema
})

// TODO: (@wcalderipe, 05/12/24): Extend to other providers.
export const PendingConnection = SharedPendingConnection.extend({
  provider: z.literal(Provider.ANCHORAGE),
  publicKey: ed25519PublicKeySchema
})
export type PendingConnection = z.infer<typeof PendingConnection>

export const InitiateConnection = z.object({
  connectionId: z.string().optional(),
  provider: z.nativeEnum(Provider)
})
export type InitiateConnection = z.infer<typeof InitiateConnection>

const SharedCreateConnection = z.object({
  connectionId: z.string().optional(),
  createdAt: z.date().optional(),
  encryptedCredentials: z.string().optional().describe('RSA encrypted JSON string of the credentials'),
  label: z.string().optional(),
  provider: z.nativeEnum(Provider),
  url: z.string().url()
})

const AnchorageCreateCredentials = z.object({
  apiKey: z.string(),
  privateKey: hexSchema.optional().describe('Ed25519 private key in hex format')
})

export const CreateCredentials = AnchorageCreateCredentials
export type CreateCredentials = z.infer<typeof CreateCredentials>

// TODO: (@wcalderipe, 05/12/24): Extend to other providers.
export const CreateConnection = SharedCreateConnection.extend({
  provider: z.literal(Provider.ANCHORAGE),
  credentials: CreateCredentials.optional()
})
export type CreateConnection = z.infer<typeof CreateConnection>

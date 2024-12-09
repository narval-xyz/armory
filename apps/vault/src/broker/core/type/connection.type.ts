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
export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus]

export const BaseConnection = z.object({
  connectionId: z.string(),
  clientId: z.string(),
  provider: z.nativeEnum(Provider),
  url: z.string().url().optional(),
  integrity: z.string(),
  label: z.string().optional(),
  credentials: z.unknown().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const AnchorageCredentials = z.object({
  apiKey: z.string().optional(),
  publicKey: ed25519PublicKeySchema,
  privateKey: ed25519PrivateKeySchema
})
export type AnchorageCredentials = z.infer<typeof AnchorageCredentials>

const ActiveConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.ACTIVE),
  provider: z.literal(Provider.ANCHORAGE),
  credentials: AnchorageCredentials
})
export type ActiveConnection = z.infer<typeof ActiveConnection>

const RevokedConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.REVOKED),
  provider: z.literal(Provider.ANCHORAGE),
  revokedAt: z.date()
})
export type RevokedConnection = z.infer<typeof RevokedConnection>

export const PendingConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.PENDING),
  provider: z.literal(Provider.ANCHORAGE),
  credentials: AnchorageCredentials,
  encryptionPublicKey: rsaPublicKeySchema.optional()
})
export type PendingConnection = z.infer<typeof PendingConnection>

export const Connection = z.discriminatedUnion('status', [ActiveConnection, RevokedConnection, PendingConnection])
export type Connection = z.infer<typeof Connection>

export const InitiateConnection = z.object({
  connectionId: z.string().optional(),
  provider: z.nativeEnum(Provider)
})
export type InitiateConnection = z.infer<typeof InitiateConnection>

export const CreateCredentials = z.object({
  apiKey: z.string(),
  privateKey: hexSchema.optional().describe('Ed25519 private key in hex format')
})
export type CreateCredentials = z.infer<typeof CreateCredentials>

export const CreateConnection = z.object({
  connectionId: z.string().optional(),
  createdAt: z.date().optional(),
  encryptedCredentials: z.string().optional().describe('RSA encrypted JSON string of the credentials'),
  label: z.string().optional(),
  provider: z.literal(Provider.ANCHORAGE),
  url: z.string().url(),
  credentials: CreateCredentials.optional()
})
export type CreateConnection = z.infer<typeof CreateConnection>

export const isPendingConnection = (connection: Connection): connection is PendingConnection => {
  return connection.status === ConnectionStatus.PENDING
}

export const isActiveConnection = (connection: Connection): connection is ActiveConnection => {
  return connection.status === ConnectionStatus.ACTIVE
}

export const isRevokedConnection = (connection: Connection): connection is RevokedConnection => {
  return connection.status === ConnectionStatus.REVOKED
}

import { hexSchema } from '@narval/policy-engine-shared'
import { ed25519PrivateKeySchema, ed25519PublicKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'

export const Provider = {
  ANCHORAGE: 'anchorage'
} as const
export type Provider = (typeof Provider)[keyof typeof Provider]

export const ConnectionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked'
} as const
export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus]

export const BaseConnection = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  label: z.string().optional(),
  provider: z.nativeEnum(Provider),
  revokedAt: z.date().optional(),
  status: z.nativeEnum(ConnectionStatus).default(ConnectionStatus.ACTIVE),
  updatedAt: z.date(),
  url: z.string().url().optional()
})

export const AnchorageCredentials = z.object({
  apiKey: z.string().optional(),
  publicKey: ed25519PublicKeySchema,
  privateKey: ed25519PrivateKeySchema
})
export type AnchorageCredentials = z.infer<typeof AnchorageCredentials>

export const ActiveAnchorageCredentials = AnchorageCredentials.extend({
  apiKey: z.string()
})
export type ActiveAnchorageCredentials = z.infer<typeof ActiveAnchorageCredentials>

export const ActiveConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.ACTIVE),
  provider: z.literal(Provider.ANCHORAGE),
  url: z.string().url()
})
export type ActiveConnection = z.infer<typeof ActiveConnection>
export const ActiveConnectionWithCredentials = ActiveConnection.extend({
  credentials: ActiveAnchorageCredentials
})
export type ActiveConnectionWithCredentials = z.infer<typeof ActiveConnectionWithCredentials>

const RevokedConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.REVOKED),
  provider: z.literal(Provider.ANCHORAGE),
  revokedAt: z.date()
})
export type RevokedConnection = z.infer<typeof RevokedConnection>
export const RevokedConnectionWithCredentials = RevokedConnection.extend({
  credentials: z.null()
})
export type RevokedConnectionWithCredentials = z.infer<typeof RevokedConnectionWithCredentials>

export const PendingConnection = BaseConnection.extend({
  status: z.literal(ConnectionStatus.PENDING),
  provider: z.literal(Provider.ANCHORAGE),
  encryptionPublicKey: rsaPublicKeySchema.optional()
})
export type PendingConnection = z.infer<typeof PendingConnection>
export const PendingConnectionWithCredentials = PendingConnection.extend({
  credentials: AnchorageCredentials.nullable()
})
export type PendingConnectionWithCredentials = z.infer<typeof PendingConnectionWithCredentials>

export const Connection = z.discriminatedUnion('status', [ActiveConnection, RevokedConnection, PendingConnection])
export type Connection = z.infer<typeof Connection>
// This is the only type that should be including Credentials on it. The rest do not, so we don't accidentally use them.
export const ConnectionWithCredentials = z.discriminatedUnion('status', [
  ActiveConnectionWithCredentials,
  RevokedConnectionWithCredentials,
  PendingConnectionWithCredentials
])
export type ConnectionWithCredentials = z.infer<typeof ConnectionWithCredentials>

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

export const UpdateConnection = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  credentials: CreateCredentials.nullish(),
  encryptedCredentials: z.string().optional().describe('RSA encrypted JSON string of the credentials'),
  label: z.string().optional(),
  status: z.nativeEnum(ConnectionStatus).optional(),
  updatedAt: z.date().optional(),
  url: z.string().url().optional()
})
export type UpdateConnection = z.infer<typeof UpdateConnection>

export const isPendingConnection = (connection: Connection): connection is PendingConnection => {
  return connection.status === ConnectionStatus.PENDING
}

export const isActiveConnection = (connection: Connection): connection is ActiveConnection => {
  return connection.status === ConnectionStatus.ACTIVE
}

export const isRevokedConnection = (connection: Connection): connection is RevokedConnection => {
  return connection.status === ConnectionStatus.REVOKED
}

export const PublicConnection = BaseConnection.pick({ connectionId: true, status: true, label: true, provider: true })
export type PublicConnection = z.infer<typeof PublicConnection>

// Connection is "special". It has encrypted data that must be queried more specifically, therefore we will separate the
// types to have one that includes "encrypted" data and another that does not.

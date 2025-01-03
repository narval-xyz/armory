import { rsaPublicKeySchema } from '@narval/signature'
import { z } from 'zod'
import { Provider } from './provider.type'

//
// Type
//

export const ConnectionStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked'
} as const
export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus]

export const ConnectionWithCredentials = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  createdAt: z.date(),
  label: z.string().optional(),
  provider: z.nativeEnum(Provider),
  revokedAt: z.date().optional(),
  status: z.nativeEnum(ConnectionStatus).default(ConnectionStatus.ACTIVE),
  updatedAt: z.date(),
  url: z.string().url().optional(),
  credentials: z.unknown().nullish()
})
export type ConnectionWithCredentials = z.infer<typeof ConnectionWithCredentials>

//
// Read Connection (without credentials)
//

const ReadConnection = ConnectionWithCredentials.omit({ credentials: true }).strip()

export const ActiveConnection = ReadConnection.extend({
  status: z.literal(ConnectionStatus.ACTIVE),
  url: z.string().url()
})
export type ActiveConnection = z.infer<typeof ActiveConnection>

const RevokedConnection = ReadConnection.extend({
  status: z.literal(ConnectionStatus.REVOKED),
  revokedAt: z.date()
})
export type RevokedConnection = z.infer<typeof RevokedConnection>

export const PendingConnection = ReadConnection.extend({
  status: z.literal(ConnectionStatus.PENDING),
  encryptionPublicKey: rsaPublicKeySchema.optional()
})
export type PendingConnection = z.infer<typeof PendingConnection>

export const Connection = z.discriminatedUnion('status', [ActiveConnection, RevokedConnection, PendingConnection])
export type Connection = z.infer<typeof Connection>

//
// Operation
//

export const InitiateConnection = z.object({
  connectionId: z.string().optional(),
  provider: z.nativeEnum(Provider)
})
export type InitiateConnection = z.infer<typeof InitiateConnection>

export const CreateConnection = z.object({
  connectionId: z.string().optional(),
  createdAt: z.date().optional(),
  encryptedCredentials: z.string().optional().describe('RSA encrypted JSON string of the credentials'),
  label: z.string().optional(),
  provider: z.nativeEnum(Provider),
  url: z.string().url(),
  credentials: z.unknown().optional()
})
export type CreateConnection = z.infer<typeof CreateConnection>

export const UpdateConnection = z.object({
  clientId: z.string(),
  connectionId: z.string(),
  credentials: z.unknown().nullish(),
  encryptedCredentials: z.string().optional().describe('RSA encrypted JSON string of the credentials'),
  label: z.string().optional(),
  status: z.nativeEnum(ConnectionStatus).optional(),
  updatedAt: z.date().optional(),
  url: z.string().url().optional()
})
export type UpdateConnection = z.infer<typeof UpdateConnection>

//
// Type Guard
//

export const isPendingConnection = (connection: Connection): connection is PendingConnection => {
  return connection.status === ConnectionStatus.PENDING
}

export const isActiveConnection = (connection: Connection): connection is ActiveConnection => {
  return connection.status === ConnectionStatus.ACTIVE
}

export const isRevokedConnection = (connection: Connection): connection is RevokedConnection => {
  return connection.status === ConnectionStatus.REVOKED
}

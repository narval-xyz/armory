import { Ed25519PrivateKey } from '@narval/signature'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider } from '../../type/provider.type'
import { AnchorageCredentials } from './anchorage.type'

export function validateConnection(
  connection: ConnectionWithCredentials
): asserts connection is ConnectionWithCredentials & {
  url: string
  credentials: {
    apiKey: string
    privateKey: Ed25519PrivateKey
  }
} {
  const context = {
    clientId: connection.clientId,
    connectionId: connection.connectionId,
    provider: connection.provider,
    status: connection.status,
    url: connection.url
  }

  if (connection.provider !== Provider.ANCHORAGE) {
    throw new ConnectionInvalidException({
      message: 'Invalid connection provider for Anchorage',
      context
    })
  }

  if (!connection.url) {
    throw new ConnectionInvalidException({
      message: 'Anchorage connection missing URL',
      context
    })
  }

  if (!connection.credentials) {
    throw new ConnectionInvalidException({
      message: 'Anchorage connection missing credentials',
      context
    })
  }

  const credentials = AnchorageCredentials.parse(connection.credentials)

  if (!credentials.apiKey) {
    throw new ConnectionInvalidException({
      message: 'Anchorage connection missing API key',
      context
    })
  }
}

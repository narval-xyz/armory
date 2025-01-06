import { RsaPrivateKey } from '@narval/signature'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider } from '../../type/provider.type'
import { FireblocksCredentials } from './fireblocks.type'

export function validateConnection(
  connection: ConnectionWithCredentials
): asserts connection is ConnectionWithCredentials & {
  url: string
  credentials: {
    apiKey: string
    privateKey: RsaPrivateKey
  }
} {
  const context = {
    clientId: connection.clientId,
    connectionId: connection.connectionId,
    provider: connection.provider,
    status: connection.status,
    url: connection.url
  }

  if (connection.provider !== Provider.FIREBLOCKS) {
    throw new ConnectionInvalidException({
      message: 'Invalid connection provider for Fireblocks',
      context
    })
  }

  if (!connection.url) {
    throw new ConnectionInvalidException({
      message: 'Fireblocks connection missing URL',
      context
    })
  }

  if (!connection.credentials) {
    throw new ConnectionInvalidException({
      message: 'Fireblocks connection missing credentials',
      context
    })
  }

  const credentials = FireblocksCredentials.parse(connection.credentials)

  if (!credentials.apiKey) {
    throw new ConnectionInvalidException({
      message: 'Fireblocks connection missing API key',
      context
    })
  }
}

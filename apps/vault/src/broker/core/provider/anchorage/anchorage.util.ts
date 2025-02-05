import { Ed25519PrivateKey } from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { BrokerException } from '../../exception/broker.exception'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider } from '../../type/provider.type'
import { TransferPartyType } from '../../type/transfer.type'
import { AnchorageCredentials, AnchorageResourceType } from './anchorage.type'

export const CONCURRENT_ANCHORAGE_REQUESTS = 5

export type ValidConnection = {
  url: string
  credentials: {
    apiKey: string
    privateKey: Ed25519PrivateKey
  }
  clientId: string
  connectionId: string
}

export function validateConnection(
  connection: ConnectionWithCredentials
): asserts connection is ConnectionWithCredentials & ValidConnection {
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

export const transferPartyTypeToAnchorageResourceType = (type: TransferPartyType): AnchorageResourceType => {
  switch (type) {
    case TransferPartyType.WALLET:
      return AnchorageResourceType.VAULT
    case TransferPartyType.ACCOUNT:
      return AnchorageResourceType.WALLET
    case TransferPartyType.ADDRESS:
      return AnchorageResourceType.ADDRESS
    default:
      throw new BrokerException({
        message: 'Cannot map transfer party to Anchorage resource type',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        context: { type }
      })
  }
}

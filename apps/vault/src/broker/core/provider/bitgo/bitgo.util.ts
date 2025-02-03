import { HttpStatus } from '@nestjs/common'
import { BrokerException } from '../../exception/broker.exception'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider } from '../../type/provider.type'
import { TransferStatus } from '../../type/transfer.type'
import { BitgoInputCredentials } from './bitgo.type'

export const CONCURRENT_BITGO_REQUEST = 5

export type ValidConnection = {
  url: string
  credentials: {
    apiKey: string
    walletPassphrase?: string
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

  if (connection.provider !== Provider.BITGO) {
    throw new ConnectionInvalidException({
      message: 'Invalid connection provider for BitGo',
      context
    })
  }

  if (!connection.url) {
    throw new ConnectionInvalidException({
      message: 'BitGo connection missing URL',
      context
    })
  }

  if (!connection.credentials) {
    throw new ConnectionInvalidException({
      message: 'BitGo connection missing credentials',
      context
    })
  }

  const credentials = BitgoInputCredentials.parse(connection.credentials)

  if (!credentials.apiKey) {
    throw new ConnectionInvalidException({
      message: 'BitGo connection missing API key',
      context
    })
  }
}

export function mapBitgoStateToInternalStatus(state: string): TransferStatus {
  switch (state) {
    case 'pendingCommitment':
      return TransferStatus.PROCESSING
    case 'signed':
      return TransferStatus.PROCESSING
    case 'pendingApproval':
      return TransferStatus.PROCESSING
    case 'initialized':
      return TransferStatus.PROCESSING
    case 'pendingDelivery':
      return TransferStatus.PROCESSING
    case 'pendingUserSignature':
      return TransferStatus.PROCESSING
    case 'canceled':
      return TransferStatus.FAILED
    case 'rejected':
      return TransferStatus.FAILED
    case 'delivered':
      return TransferStatus.SUCCESS
    default:
      throw new BrokerException({
        message: `Unknown BitGo state: ${state}`,
        context: { state },
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
  }
}

export function decideState(states: TransferStatus[]): TransferStatus {
  if (states.includes(TransferStatus.FAILED)) {
    return TransferStatus.FAILED
  }

  if (states.some((state) => state === TransferStatus.SUCCESS)) {
    return TransferStatus.SUCCESS
  }

  if (states.includes(TransferStatus.PROCESSING)) {
    return TransferStatus.PROCESSING
  }

  throw new BrokerException({
    message: 'Unknown or empty state list',
    context: { states },
    suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
  })
}

import { RsaPrivateKey } from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { BrokerException } from '../../exception/broker.exception'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Provider } from '../../type/provider.type'
import { FireblocksCredentials } from './fireblocks.type'

export const CONCURRENT_FIREBLOCKS_REQUESTS = 5

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

export type FireblocksAccountExternalId = `${string}-${string}`
export function getFireblocksAssetWalletExternalId({
  vaultId,
  networkId
}: {
  vaultId: string
  networkId: string
}): string {
  return `${vaultId.toString()}-${networkId}`
}

export type FireblocksAssetWalletId = { vaultId: string; networkId: string }
export function toFireblocksAssetWalletExternalId(externalId: string): FireblocksAssetWalletId {
  const matches = externalId.match(/^([^-]+)-([^-]+)$/)
  if (!matches) {
    throw new BrokerException({
      message: 'The external ID does not match composed standard for fireblocks',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { externalId }
    })
  }

  const [, vaultId, networkId] = matches
  return {
    vaultId,
    networkId
  }
}

export type FireblocksAddressExternalId = `${string}-${string}-${string}`
export function getFireblocksAssetAddressExternalId({
  vaultId,
  networkId,
  address
}: {
  vaultId: string
  networkId: string
  address: string
}): string {
  return `${vaultId}-${networkId}-${address}`
}

export type FireblocksAssetAddressId = { vaultId: string; networkId: string; address: string }
export function toFireblocksAssetAddressExternalId(externalId: string): FireblocksAssetAddressId {
  const matches = externalId.match(/^([^-]+)-([^-]+)-([^-]+)$/)
  if (!matches) {
    throw new BrokerException({
      message: 'The external ID does not match composed standard for fireblocks',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { externalId }
    })
  }

  const [, vaultId, networkId, address] = matches
  return {
    vaultId,
    networkId,
    address
  }
}

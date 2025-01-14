import { RsaPrivateKey } from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { BrokerException } from '../../exception/broker.exception'
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

export type FireblocksAccountExternalId = `fireblocks/vaults/${string}/wallets/${string}`
export function getFireblocksAssetWalletExternalId({ vaultId, assetId }: { vaultId: string; assetId: string }): string {
  return `fireblocks/vaults/${vaultId}/wallets/${assetId}`
}

export type FireblocksAssetWalletId = { vaultId: string; assetId: string }
export function toFireblocksAssetWalletExternalId(externalId: string): FireblocksAssetWalletId {
  const matches = externalId.match(/^fireblocks\/vaults\/([^/]+)\/wallets\/([^/]+)$/)
  if (!matches) {
    throw new BrokerException({
      message: 'The external ID does not match composed standard for fireblocks',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    })
  }

  const [, vaultId, assetId] = matches
  return {
    vaultId,
    assetId
  }
}

import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { uniq } from 'lodash'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { ConnectionInvalidException } from '../../exception/connection-invalid.exception'
import { AccountService } from '../../service/account.service'
import { AddressService } from '../../service/address.service'
import { KnownDestinationService } from '../../service/known-destination.service'
import { WalletService } from '../../service/wallet.service'
import { ActiveConnection, ActiveConnectionWithCredentials, Connection, Provider } from '../../type/connection.type'
import { Address, KnownDestination, Wallet } from '../../type/indexed-resources.type'
import {
  ProviderSyncService,
  SyncContext,
  SyncOperationType,
  SyncResult,
  isCreateOperation
} from '../../type/provider.type'
import { buildEmptyContext } from '../../util/provider-sync.util'

@Injectable()
export class AnchorageSyncService implements ProviderSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly knownDestinationService: KnownDestinationService,
    private readonly logger: LoggerService
  ) {}

  async sync(connection: ActiveConnectionWithCredentials): Promise<SyncResult> {
    const initialContext = buildEmptyContext({ connection, now: new Date() })

    const syncWalletContext = await this.syncWallets(initialContext)
    const syncAccountContext = await this.syncAccounts(syncWalletContext)
    const syncAddressContext = await this.syncAddresses(syncAccountContext)
    const lastSyncContext = await this.syncKnownDestinations(syncAddressContext)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { connection: _conn, ...result } = lastSyncContext

    return result
  }

  async syncWallets(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage wallets', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    const anchorageVaults = await this.anchorageClient.getVaults({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageVaults.map((vault) => vault.vaultId)
      }
    })

    const existingWalletByExternalId = new Map(existingWallets.map((wallet) => [wallet.externalId, wallet]))

    const missingAnchorageVaults = anchorageVaults.filter(
      (anchorageVault) => !existingWalletByExternalId.has(anchorageVault.vaultId)
    )

    const now = context.now ?? new Date()

    const createOperations = missingAnchorageVaults.map((vault) => {
      return {
        type: SyncOperationType.CREATE,
        create: {
          accounts: [],
          clientId: connection.clientId,
          connections: [ActiveConnection.parse(connection)],
          createdAt: now,
          externalId: vault.vaultId,
          label: vault.name,
          provider: Provider.ANCHORAGE,
          updatedAt: now,
          walletId: randomUUID()
        }
      }
    })

    const updateOperations = anchorageVaults
      .reduce<Wallet[]>((acc, incoming) => {
        const existing = existingWalletByExternalId.get(incoming.vaultId)
        if (!existing) return acc

        const hasConnection = existing.connections.some((conn) => conn.connectionId === connection.connectionId)
        const hasDataChanges = existing.label !== incoming.name

        if (hasDataChanges || !hasConnection) {
          acc.push({
            ...existing,
            label: incoming.name,
            updatedAt: now,
            connections: [...existing.connections, this.toConnectionAssociation(connection)]
          })
        }

        return acc
      }, [])
      .map((update) => ({ type: SyncOperationType.UPDATE, update }))

    return {
      ...context,
      wallets: [...createOperations, ...updateOperations]
    }
  }

  private toConnectionAssociation(connection: Connection) {
    return {
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: connection.createdAt,
      label: connection.label,
      provider: connection.provider,
      revokedAt: connection.revokedAt,
      status: connection.status,
      updatedAt: connection.updatedAt,
      url: connection.url
    }
  }

  async syncAccounts(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage accounts', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    const anchorageWallets = await this.anchorageClient.getWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const walletExternalIds = uniq(anchorageWallets.map(({ vaultId }) => vaultId))

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: walletExternalIds
      }
    })

    const { data: existingAccounts } = await this.accountService.findAll(connection.clientId, {
      filters: {
        externalIds: uniq(anchorageWallets.map((wallet) => wallet.walletId))
      }
    })

    const existingAccountsByExternalId = new Map(existingAccounts.map((account) => [account.externalId, account]))

    const missingAnchorageWallets = anchorageWallets.filter(
      (anchorageVault) => !existingAccountsByExternalId.has(anchorageVault.walletId)
    )

    const walletsIndexedByExternalId = existingWallets.reduce(
      (idx, wallet) => idx.set(wallet.externalId, wallet),
      new Map<string, Wallet>()
    )

    const contextWalletsIndexedByExternalId = new Map(
      context.wallets.filter(isCreateOperation).map(({ create }) => [create.externalId, create])
    )

    const now = context.now ?? new Date()

    const operations = missingAnchorageWallets.map((anchorageWallet) => {
      const externalId = anchorageWallet.walletId
      const parentExternalId = anchorageWallet.vaultId
      // Either look up the existing wallets in the database or in the sync context.
      const wallet =
        contextWalletsIndexedByExternalId.get(parentExternalId) || walletsIndexedByExternalId.get(parentExternalId)

      if (wallet) {
        return {
          type: SyncOperationType.CREATE,
          create: {
            accountId: randomUUID(),
            walletId: wallet.walletId,
            label: anchorageWallet.walletName,
            clientId: connection.clientId,
            provider: Provider.ANCHORAGE,
            addresses: [],
            externalId,
            createdAt: now,
            updatedAt: now,
            // TODO: Map their networkId to SLIP 44 format.
            networkId: anchorageWallet.networkId
          }
        }
      }

      return {
        type: SyncOperationType.FAILED,
        externalId,
        message: 'Parent wallet for account not found',
        context: { anchorageWalletId: parentExternalId }
      }
    })

    return {
      ...context,
      accounts: operations
    }
  }

  async syncAddresses(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage addresses', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    const now = context.now || new Date()

    const signKey = connection.credentials.privateKey

    const anchorageVaults = await this.anchorageClient.getVaults({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey
    })

    const getVaultAddressesRequests = anchorageVaults.flatMap((anchorageVault) =>
      anchorageVault.assets.map((asset) => ({
        signKey,
        apiKey: connection.credentials.apiKey,
        assetType: asset.assetType,
        url: connection.url,
        vaultId: anchorageVault.vaultId
      }))
    )

    const anchorageAddresses = (
      await Promise.all(getVaultAddressesRequests.map((request) => this.anchorageClient.getVaultAddresses(request)))
    ).flat()

    // Query existing accounts to associate them with their children addresses.
    const { data: existingAccounts } = await this.accountService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageAddresses.map((anchorageAddress) => anchorageAddress.walletId)
      }
    })

    const existingAccountsByExternalId = new Map(existingAccounts.map((account) => [account.externalId, account]))

    const { data: existingAddresses } = await this.addressService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageAddresses.map((anchorageAddress) => anchorageAddress.addressId)
      }
    })

    const existingAddressesByExternalId = new Map(existingAddresses.map((address) => [address.externalId, address]))

    const contextAccountsIndexedByExternalId = new Map(
      context.accounts.filter(isCreateOperation).map(({ create }) => [create.externalId, create])
    )

    const uniqueAnchorageAddresses = Array.from(
      new Map(anchorageAddresses.map((anchorageAddress) => [anchorageAddress.addressId, anchorageAddress])).values()
    )

    const missingAnchorageAddresses = uniqueAnchorageAddresses.filter(
      (anchorageAddress) => !existingAddressesByExternalId.has(anchorageAddress.addressId)
    )

    const operations = missingAnchorageAddresses.map((anchorageAddress) => {
      const externalId = anchorageAddress.addressId
      const parentExternalId = anchorageAddress.walletId
      const account =
        existingAccountsByExternalId.get(parentExternalId) || contextAccountsIndexedByExternalId.get(parentExternalId)

      if (account) {
        return {
          type: SyncOperationType.CREATE,
          create: {
            accountId: account.accountId,
            address: anchorageAddress.address,
            addressId: randomUUID(),
            clientId: connection.clientId,
            createdAt: now,
            externalId,
            provider: Provider.ANCHORAGE,
            updatedAt: now
          } satisfies Address
        }
      }

      return {
        type: SyncOperationType.FAILED,
        externalId,
        message: 'Anchorage address parent account not found'
      }
    })

    return {
      ...context,
      addresses: operations
    }
  }

  async syncKnownDestinations(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage known destinations', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    // Fetch current state from Anchorage
    const anchorageTrustedDestinations = await this.anchorageClient.getTrustedDestinations({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const now = context.now || new Date()

    const { data: existingKnownDestinations } = await this.knownDestinationService.findAll(connection.clientId)

    const incomingMap = new Map(anchorageTrustedDestinations.map((dest) => [dest.id, dest]))
    const existingMap = new Map(existingKnownDestinations.map((dest) => [dest.externalId, dest]))

    // TODO: Review this before merge.
    // 1. the parse on acc.push
    // 2. the error handling on `.parse`
    const updateOperations = anchorageTrustedDestinations
      .reduce<KnownDestination[]>((acc, incoming) => {
        const existing = existingMap.get(incoming.id)
        if (!existing) return acc

        const hasConnection = existing.connections.some((conn) => conn.connectionId === connection.connectionId)
        const hasDataChanges =
          (existing.label || undefined) !== incoming.crypto.memo ||
          (existing.assetId || undefined) !== incoming.crypto.assetType

        if (hasDataChanges || !hasConnection) {
          acc.push(
            KnownDestination.parse({
              ...existing,
              label: incoming.crypto.memo,
              assetId: incoming.crypto.assetType,
              updatedAt: now,
              connections: [...existing.connections, connection]
            })
          )
        }

        return acc
      }, [])
      .map((update) => ({ type: SyncOperationType.UPDATE, update }))

    const createOperations = anchorageTrustedDestinations
      .filter((anchorageTrustedAddress) => !existingMap.has(anchorageTrustedAddress.id))
      .map((anchorageTrustedAddress) =>
        KnownDestination.parse({
          knownDestinationId: randomUUID(),
          address: anchorageTrustedAddress.crypto.address,
          clientId: connection.clientId,
          externalId: anchorageTrustedAddress.id,
          label: anchorageTrustedAddress.crypto.memo,
          assetId: anchorageTrustedAddress.crypto.assetType,
          provider: Provider.ANCHORAGE,
          networkId: anchorageTrustedAddress.crypto.networkId,
          createdAt: now,
          updatedAt: now,
          connections: [connection]
        })
      )
      .map((kd) => ({ type: SyncOperationType.CREATE, create: kd }))

    const deleteOperations = existingKnownDestinations
      .filter((dest) => !incomingMap.has(dest.externalId))
      .map((kd) => ({ type: SyncOperationType.DELETE, entityId: kd.knownDestinationId }))

    return {
      ...context,
      knownDestinations: [...createOperations, ...updateOperations, ...deleteOperations]
    }
  }

  private validateConnection(
    connection: ActiveConnectionWithCredentials
  ): asserts connection is ActiveConnectionWithCredentials & {
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
        message: 'Cannot sync without a connection URL',
        context
      })
    }

    if (!connection.credentials?.apiKey && !connection.credentials?.privateKey) {
      throw new ConnectionInvalidException({
        message: 'Cannot sync without API key and/or signing key',
        context
      })
    }
  }
}

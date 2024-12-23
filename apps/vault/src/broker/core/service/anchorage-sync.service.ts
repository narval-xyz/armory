import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { uniq } from 'lodash'
import { v4 as uuid } from 'uuid'
import { AnchorageClient } from '../../http/client/anchorage.client'
import { ConnectionInvalidException } from '../exception/connection-invalid.exception'
import { SyncException } from '../exception/sync.exception'
import { ActiveConnection, ActiveConnectionWithCredentials, Provider } from '../type/connection.type'
import { Account, Address, KnownDestination, Wallet } from '../type/indexed-resources.type'
import { AccountService } from './account.service'
import { AddressService } from './address.service'
import { KnownDestinationService } from './know-destination.service'
import { WalletService } from './wallet.service'

@Injectable()
export class AnchorageSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly knownDestinationService: KnownDestinationService,
    private readonly logger: LoggerService
  ) {}

  async sync(connection: ActiveConnectionWithCredentials): Promise<void> {
    await this.syncWallets(connection)
    await this.syncAccounts(connection)
    await this.syncAddresses(connection)
    await this.syncKnownDestinations(connection)
  }

  async syncWallets(connection: ActiveConnectionWithCredentials) {
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

    const now = new Date()

    const existingMap = new Map(existingWallets.map((wallet) => [wallet.externalId, wallet]))

    const toBeUpdated = anchorageVaults.reduce<Wallet[]>((acc, incoming) => {
      const existing = existingMap.get(incoming.vaultId)
      if (!existing) return acc

      const hasConnection = existing.connections.some((conn) => conn.connectionId === connection.connectionId)
      const hasDataChanges = existing.label !== incoming.name

      if (hasDataChanges || !hasConnection) {
        acc.push({
          ...existing,
          label: incoming.name,
          updatedAt: now,
          connections: [...existing.connections, connection]
        })
      }

      return acc
    }, [])

    const toBeCreated: Wallet[] = anchorageVaults
      .filter((vault) => !existingMap.has(vault.vaultId))
      .map((vault) => ({
        accounts: [],
        clientId: connection.clientId,
        connections: [ActiveConnection.parse(connection)],
        createdAt: now,
        externalId: vault.vaultId,
        label: vault.name,
        provider: Provider.ANCHORAGE,
        updatedAt: now,
        walletId: uuid()
      }))

    try {
      const created = await this.walletService.bulkCreate(toBeCreated)
      const updated = await this.walletService.bulkUpdate(toBeUpdated)

      return {
        created,
        updated
      }
    } catch (error) {
      throw new SyncException({
        message: 'Failed to persist wallets',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }
  }

  async syncAccounts(connection: ActiveConnectionWithCredentials) {
    this.logger.log('Sync Anchorage accounts', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    const now = new Date()

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

    const accounts: Account[] = missingAnchorageWallets.map((anchorageWallet) => {
      const wallet = walletsIndexedByExternalId.get(anchorageWallet.vaultId)

      if (!wallet) {
        throw new SyncException({
          message: 'Parent wallet for account not found',
          suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
          context: {
            walletExternalId: anchorageWallet.vaultId,
            accountExternalId: anchorageWallet.walletId
          }
        })
      }

      return {
        accountId: uuid(),
        walletId: wallet?.walletId,
        label: anchorageWallet.walletName,
        clientId: connection.clientId,
        provider: Provider.ANCHORAGE,
        addresses: [],
        externalId: anchorageWallet.walletId,
        createdAt: now,
        updatedAt: now,
        // TODO: Map their networkId to SLIP 44 format.
        networkId: anchorageWallet.networkId
      }
    })

    try {
      await this.accountService.bulkCreate(accounts)
    } catch (error) {
      throw new SyncException({
        message: 'Fail to persist accounts',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }

    return accounts
  }

  async syncAddresses(connection: ActiveConnectionWithCredentials) {
    this.logger.log('Sync Anchorage addresses', {
      connectionId: connection.credentials,
      clientId: connection.clientId,
      url: connection.url
    })

    this.validateConnection(connection)

    const now = new Date()

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

    const uniqueAnchorageAddresses = Array.from(
      new Map(anchorageAddresses.map((anchorageAddress) => [anchorageAddress.addressId, anchorageAddress])).values()
    )

    const missingAnchorageAddresses = uniqueAnchorageAddresses.filter(
      (anchorageAddress) => !existingAddressesByExternalId.has(anchorageAddress.addressId)
    )

    const addresses: Address[] = missingAnchorageAddresses.map((anchorageAddress) => {
      const account = existingAccountsByExternalId.get(anchorageAddress.walletId)

      if (account) {
        return {
          accountId: account.accountId,
          address: anchorageAddress.address,
          addressId: uuid(),
          clientId: connection.clientId,
          createdAt: now,
          externalId: anchorageAddress.addressId,
          provider: Provider.ANCHORAGE,
          updatedAt: now
        } satisfies Address
      }

      throw new SyncException({
        message: 'Anchorage address parent account not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    })

    try {
      await this.addressService.bulkCreate(addresses)
    } catch (error) {
      throw new SyncException({
        message: 'Fail to persist addresses',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }

    return addresses
  }

  async syncKnownDestinations(connection: ActiveConnectionWithCredentials): Promise<{
    created: KnownDestination[]
    updated: KnownDestination[]
    deleted: number
  }> {
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

    const now = new Date()

    const { data: existingKnownDestinations } = await this.knownDestinationService.findAll(connection.clientId)

    const incomingMap = new Map(anchorageTrustedDestinations.map((dest) => [dest.id, dest]))
    const existingMap = new Map(existingKnownDestinations.map((dest) => [dest.externalId, dest]))

    const toBeUpdated = anchorageTrustedDestinations.reduce<KnownDestination[]>((acc, incoming) => {
      const existing = existingMap.get(incoming.id)
      if (!existing) return acc

      const hasConnection = existing.connections.some((conn) => conn.connectionId === connection.connectionId)
      const hasDataChanges =
        (existing.label || undefined) !== incoming.crypto.memo ||
        (existing.assetId || undefined) !== incoming.crypto.assetType

      if (hasDataChanges || !hasConnection) {
        acc.push({
          ...existing,
          label: incoming.crypto.memo,
          assetId: incoming.crypto.assetType,
          updatedAt: now,
          connections: [...existing.connections, connection]
        })
      }

      return acc
    }, [])

    const toBeCreated: KnownDestination[] = anchorageTrustedDestinations
      .filter((anchorageDest) => !existingMap.has(anchorageDest.id))
      .map((anchorageDest) =>
        KnownDestination.parse({
          knownDestinationId: uuid(),
          address: anchorageDest.crypto.address,
          clientId: connection.clientId,
          externalId: anchorageDest.id,
          label: anchorageDest.crypto.memo,
          assetId: anchorageDest.crypto.assetType,
          provider: Provider.ANCHORAGE,
          networkId: anchorageDest.crypto.networkId,
          createdAt: now,
          updatedAt: now,
          connections: [connection]
        })
      )

    const toBeDeleted = existingKnownDestinations.filter((dest) => !incomingMap.has(dest.externalId))

    try {
      this.logger.log('Deleting removed trusted destinations in anchorage from known destinations', {
        deleting: toBeDeleted.map((dest) => ({
          anchorageId: dest.externalId,
          knownDestinationId: dest.knownDestinationId
        })),
        clientId: connection.clientId
      })

      const created = await this.knownDestinationService.bulkCreate(toBeCreated)
      const deleted = await this.knownDestinationService.bulkDelete(toBeDeleted)
      const updated = await this.knownDestinationService.bulkUpdate(toBeUpdated)

      this.logger.log('Known destinations sync completed', {
        totalCreated: created.length,
        totalUpdated: updated.length,
        totalDeleted: deleted,
        clientId: connection.clientId
      })

      return {
        created,
        updated,
        deleted
      }
    } catch (error) {
      throw new SyncException({
        message: 'Failed to sync known destinations',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
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

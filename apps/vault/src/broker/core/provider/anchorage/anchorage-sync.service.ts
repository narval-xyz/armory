import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { uniq } from 'lodash'
import { AnchorageClient } from '../../../http/client/anchorage.client'
import { UpdateAccount } from '../../../persistence/repository/account.repository'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { AccountService } from '../../service/account.service'
import { AddressService } from '../../service/address.service'
import { KnownDestinationService } from '../../service/known-destination.service'
import { WalletService } from '../../service/wallet.service'
import { Connection, ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address, KnownDestination, Wallet } from '../../type/indexed-resources.type'
import {
  Provider,
  ProviderSyncService,
  SyncContext,
  SyncOperation,
  SyncOperationType,
  SyncResult,
  isCreateOperation
} from '../../type/provider.type'
import { buildEmptyContext } from '../../util/provider-sync.util'
import { validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageSyncService implements ProviderSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly knownDestinationService: KnownDestinationService,
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService
  ) {}

  async sync(connection: ConnectionWithCredentials): Promise<SyncResult> {
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
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const anchorageVaults = await this.anchorageClient.getVaults({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageVaults.map((vault) => vault.vaultId)
      },
      pagination: { disabled: true }
    })

    const existingWalletByExternalId = new Map<string, Wallet>(
      existingWallets.map((wallet) => [wallet.externalId, wallet])
    )

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
          connections: [Connection.parse(connection)],
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
            connections: [...existing.connections, Connection.parse(connection)]
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

  async syncAccounts(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage accounts', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const anchorageWallets = await this.anchorageClient.getWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const walletExternalIds = uniq(anchorageWallets.map(({ vaultId }) => vaultId))

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: walletExternalIds
      },
      pagination: { disabled: true }
    })

    const { data: existingAccounts } = await this.accountService.findAll(connection.clientId, {
      filters: {
        externalIds: uniq(anchorageWallets.map((wallet) => wallet.walletId))
      },
      pagination: { disabled: true }
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

    const operations: SyncOperation<Account, UpdateAccount>[] = []

    for (const anchorageWallet of missingAnchorageWallets) {
      const externalId = anchorageWallet.walletId
      const parentExternalId = anchorageWallet.vaultId
      // Either look up the existing wallets in the database or in the sync context.
      const wallet =
        contextWalletsIndexedByExternalId.get(parentExternalId) || walletsIndexedByExternalId.get(parentExternalId)

      if (wallet) {
        const network = await this.networkRepository.findByExternalId(Provider.ANCHORAGE, anchorageWallet.networkId)

        if (network) {
          operations.push({
            type: SyncOperationType.CREATE,
            create: {
              externalId,
              accountId: randomUUID(),
              addresses: [],
              clientId: connection.clientId,
              createdAt: now,
              label: anchorageWallet.walletName,
              networkId: network.networkId,
              provider: Provider.ANCHORAGE,
              updatedAt: now,
              walletId: wallet.walletId
            }
          })
        } else {
          operations.push({
            type: SyncOperationType.SKIP,
            externalId,
            message: 'Unknown Anchorage wallet network ID',
            context: {
              externalId,
              anchorageNetworkId: anchorageWallet.networkId
            }
          })
        }
      } else {
        operations.push({
          type: SyncOperationType.FAILED,
          externalId,
          message: 'Parent wallet for account not found',
          context: { anchorageWalletId: parentExternalId }
        })
      }
    }

    return {
      ...context,
      accounts: operations
    }
  }

  async syncAddresses(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Anchorage addresses', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

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
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    // Fetch current state from Anchorage
    const anchorageTrustedDestinations = await this.anchorageClient.getTrustedDestinations({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const now = context.now || new Date()

    const { data: existingKnownDestinations } = await this.knownDestinationService.findAll(connection.clientId, {
      pagination: { disabled: true }
    })

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

    const missingDestinations = anchorageTrustedDestinations.filter(
      (anchorageTrustedAddress) => !existingMap.has(anchorageTrustedAddress.id)
    )

    const createOperations: SyncOperation<KnownDestination, KnownDestination>[] = []

    for (const anchorageTrustedAddress of missingDestinations) {
      const externalId = anchorageTrustedAddress.id
      const network = await this.networkRepository.findByExternalId(
        Provider.ANCHORAGE,
        anchorageTrustedAddress.crypto.networkId
      )

      if (network) {
        const knownDestination = KnownDestination.parse({
          externalId,
          knownDestinationId: randomUUID(),
          address: anchorageTrustedAddress.crypto.address,
          clientId: connection.clientId,
          label: anchorageTrustedAddress.crypto.memo,
          assetId: anchorageTrustedAddress.crypto.assetType,
          provider: Provider.ANCHORAGE,
          networkId: network.networkId,
          createdAt: now,
          updatedAt: now,
          connections: [connection]
        })

        createOperations.push({ type: SyncOperationType.CREATE, create: knownDestination })
      } else {
        createOperations.push({
          type: SyncOperationType.SKIP,
          externalId,
          message: 'Unknown Anchorage trusted address network ID',
          context: {
            externalId,
            anchorageNetworkId: anchorageTrustedAddress.crypto.networkId
          }
        })
      }
    }

    const deleteOperations = existingKnownDestinations
      .filter((dest) => !incomingMap.has(dest.externalId))
      .map((kd) => ({ type: SyncOperationType.DELETE, entityId: kd.knownDestinationId }))

    return {
      ...context,
      knownDestinations: [...createOperations, ...updateOperations, ...deleteOperations]
    }
  }
}

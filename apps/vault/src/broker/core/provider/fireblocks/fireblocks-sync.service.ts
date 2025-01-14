import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { uniq } from 'lodash/fp'
import { FireblocksClient, WhitelistedWallet } from '../../../http/client/fireblocks.client'
import { UpdateAccount } from '../../../persistence/repository/account.repository'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { AccountService } from '../../service/account.service'
import { KnownDestinationService } from '../../service/known-destination.service'
import { WalletService } from '../../service/wallet.service'
import { Connection, ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address, KnownDestination, UpdateWallet, Wallet } from '../../type/indexed-resources.type'
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
import { WhitelistClassification } from './fireblocks.type'
import { getFireblocksAssetWalletExternalId, validateConnection } from './fireblocks.util'

@Injectable()
export class FireblocksSyncService implements ProviderSyncService {
  constructor(
    private readonly fireblocksClient: FireblocksClient,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly knownDestinationService: KnownDestinationService,
    private readonly networkRepository: NetworkRepository,
    private readonly logger: LoggerService
  ) {}

  async sync(connection: ConnectionWithCredentials): Promise<SyncResult> {
    const initialContext = buildEmptyContext({ connection, now: new Date() })
    const syncWalletContext = await this.syncWallets(initialContext)
    const syncAccountContext = await this.syncAccounts(syncWalletContext)
    // const syncAddressContext = await this.syncAddresses(syncAccountContext)
    const lastSyncContext = await this.syncKnownDestinations(syncAccountContext)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { connection: _conn, ...result } = lastSyncContext

    return result
  }

  async syncWallets(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Fireblocks wallets', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const now = context.now ?? new Date()

    const fireblocksVaultAccounts = await this.fireblocksClient.getVaultAccounts({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: uniq(fireblocksVaultAccounts.map((account) => account.id))
      },
      pagination: { disabled: true }
    })

    const operations: SyncOperation<Wallet, UpdateWallet>[] = []

    for (const account of fireblocksVaultAccounts) {
      const existingAccount = existingWallets.find((w) => w.externalId === account.id)
      if (!existingAccount) {
        operations.push({
          type: SyncOperationType.CREATE,
          create: {
            externalId: account.id,
            clientId: connection.clientId,
            createdAt: now,
            accounts: [],
            label: account.name,
            connections: [Connection.parse(connection)],
            provider: Provider.FIREBLOCKS,
            updatedAt: now,
            walletId: randomUUID()
          }
        })
        continue
      }

      const hasConnection = existingAccount.connections.some((conn) => conn.connectionId === connection.connectionId)
      const hasDataChanges = existingAccount.label !== account.name

      if (hasConnection || hasDataChanges) {
        operations.push({
          type: SyncOperationType.UPDATE,
          update: {
            ...existingAccount,
            label: account.name,
            updatedAt: now
          }
        })
      }
    }

    return {
      ...context,
      wallets: operations
    }
  }

  async syncAccounts(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Fireblocks accounts', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const fireblocksAssetWallets = await this.fireblocksClient.getAssetWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const walletExternalIds = uniq(fireblocksAssetWallets.map(({ vaultId }) => vaultId))

    const { data: existingWallets } = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: walletExternalIds
      },
      pagination: { disabled: true }
    })

    const { data: existingAccounts } = await this.accountService.findAll(connection.clientId, {
      filters: {
        externalIds: uniq(
          fireblocksAssetWallets.map((wallet) =>
            getFireblocksAssetWalletExternalId({
              vaultId: wallet.vaultId,
              assetId: wallet.assetId
            })
          )
        )
      },
      pagination: { disabled: true }
    })

    const existingAccountsByExternalId = new Map(existingAccounts.map((account) => [account.externalId, account]))

    const missingFireblocksWallets = fireblocksAssetWallets.filter(
      (fireblocksVault) =>
        !existingAccountsByExternalId.has(
          getFireblocksAssetWalletExternalId({
            vaultId: fireblocksVault.vaultId,
            assetId: fireblocksVault.assetId
          })
        )
    )

    const walletsIndexedByExternalId = new Map(existingWallets.map((wallet) => [wallet.externalId, wallet]))

    const contextWalletsIndexedByExternalId = new Map(
      context.wallets.filter(isCreateOperation).map(({ create }) => [create.externalId, create])
    )

    const now = context.now ?? new Date()

    const operations: SyncOperation<Account, UpdateAccount>[] = []

    for (const fireblocksAssetWallet of missingFireblocksWallets) {
      const externalId = getFireblocksAssetWalletExternalId({
        vaultId: fireblocksAssetWallet.vaultId,
        assetId: fireblocksAssetWallet.assetId
      })
      const parentExternalId = fireblocksAssetWallet.vaultId

      // Either look up the existing wallets in the database or in the sync context.
      const contextWallet = contextWalletsIndexedByExternalId.get(parentExternalId)
      const indexedWallet = walletsIndexedByExternalId.get(parentExternalId)

      const wallet = contextWallet || indexedWallet

      if (wallet) {
        const network = await this.networkRepository.findByExternalId(
          Provider.FIREBLOCKS,
          fireblocksAssetWallet.assetId
        )

        if (network) {
          operations.push({
            type: SyncOperationType.CREATE,
            create: {
              // Fireblocks 'assetWallet' ID is not unique. It's the networkID used per vault Account
              // In our system, each provider account has a unique external ID per client.
              // This is a specific problem from Fireblocks, so we need to be aware of the way we store the externalID in order to know how to query per ID
              externalId,
              accountId: randomUUID(),
              addresses: [],
              clientId: connection.clientId,
              createdAt: now,
              networkId: network.networkId,
              provider: Provider.FIREBLOCKS,
              updatedAt: now,
              walletId: wallet.walletId
            }
          })
        } else {
          operations.push({
            type: SyncOperationType.SKIP,
            externalId,
            message: 'Unknown Fireblocks wallet network ID',
            context: {
              externalId,
              fireblocksNetworkId: fireblocksAssetWallet.assetId
            }
          })
        }
      } else {
        operations.push({
          type: SyncOperationType.FAILED,
          externalId,

          message: 'Parent wallet for account not found',
          context: {
            fireblocksWalletId: parentExternalId,
            totalLength: existingWallets.length,
            contextWallet,
            indexedWallet
          }
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

    this.logger.log('Sync Fireblocks addresses', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const vaultAccounts = await this.fireblocksClient.getVaultAccounts({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const now = context.now ?? new Date()

    const accountOperations = await Promise.all(
      vaultAccounts.map(async (account) => {
        this.logger.log('Sync Fireblocks addresses for account', {
          clientId: connection.clientId,
          url: connection.url,
          accountId: account.id
        })

        const assetOperations = await Promise.all(
          account.assets.map(async (asset) => {
            try {
              const addresses = await this.fireblocksClient.getAddresses({
                url: connection.url,
                apiKey: connection.credentials.apiKey,
                signKey: connection.credentials.privateKey,
                vaultAccountId: account.id,
                assetId: asset.id
              })

              return addresses.map(
                (fireblocksAddress): SyncOperation<Address, Address> => ({
                  type: SyncOperationType.CREATE,
                  create: {
                    externalId: fireblocksAddress.address,
                    addressId: fireblocksAddress.address,
                    accountId: account.id,
                    address: fireblocksAddress.address,
                    clientId: connection.clientId,
                    createdAt: now,
                    provider: Provider.FIREBLOCKS,
                    updatedAt: now
                  }
                })
              )
            } catch (error) {
              const failedOperation: SyncOperation<Address, Address> = {
                type: SyncOperationType.FAILED,
                externalId: `${account.id}:${asset.id}`,
                message: `Failed to fetch addresses for account/asset: ${error.message}`,
                context: {
                  accountId: account.id,
                  assetId: asset.id,
                  error: error.message
                }
              }

              this.logger.error('Failed to fetch addresses for account/asset', {
                accountId: account.id,
                assetId: asset.id,
                error: error.message
              })

              return [failedOperation]
            }
          })
        )

        return assetOperations.flat()
      })
    )
    const operations = accountOperations.flat()

    return {
      ...context,
      addresses: operations
    }
  }

  async syncKnownDestinations(context: SyncContext): Promise<SyncContext> {
    const { connection } = context

    this.logger.log('Sync Fireblocks known destinations', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const fireblocksWhitelistedInternalsWallets = await this.fireblocksClient.getWhitelistedInternalWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const fireblocksWhitelistedExternals = await this.fireblocksClient.getWhitelistedExternalWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const fireblocksWhitelistedContracts = await this.fireblocksClient.getWhitelistedContracts({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey
    })

    const fireblocksKnownDestinations = [
      ...this.transformWhitelistedAddresses({
        whitelistedWallets: fireblocksWhitelistedContracts,
        classification: WhitelistClassification.CONTRACT
      }),
      ...this.transformWhitelistedAddresses({
        whitelistedWallets: fireblocksWhitelistedExternals,
        classification: WhitelistClassification.EXTERNAL
      }),
      ...this.transformWhitelistedAddresses({
        whitelistedWallets: fireblocksWhitelistedInternalsWallets,
        classification: WhitelistClassification.INTERNAL
      })
    ]

    const { data: existingKnownDestinations } = await this.knownDestinationService.findAll(connection.clientId, {
      filters: {
        providers: [Provider.FIREBLOCKS]
      },
      pagination: { disabled: true }
    })

    const now = context.now ?? new Date()

    const incomingMap = new Map(fireblocksKnownDestinations.map((dest) => [dest.externalId, dest]))
    const existingMap = new Map(existingKnownDestinations.map((dest) => [dest.externalId, dest]))

    const updateOperations = fireblocksKnownDestinations
      .reduce<KnownDestination[]>((acc, incoming) => {
        const existing = existingMap.get(incoming.externalId)
        if (!existing) return acc

        const hasConnection = existing.connections.some((conn) => conn.connectionId === connection.connectionId)
        const hasDataChanges = (existing.label || undefined) !== incoming.label

        if (hasDataChanges || !hasConnection) {
          acc.push(
            KnownDestination.parse({
              ...existing,
              label: incoming.label,
              updatedAt: now,
              connections: [...existing.connections, connection]
            })
          )
        }

        return acc
      }, [])
      .map((update) => ({ type: SyncOperationType.UPDATE, update }))

    const missingDestinations = fireblocksKnownDestinations.filter(
      (fireblocksTrustedAddress) => !existingMap.has(fireblocksTrustedAddress.externalId)
    )

    const createOperations: SyncOperation<KnownDestination, KnownDestination>[] = []

    for (const fireblocksTrustedAddress of missingDestinations) {
      const externalId = fireblocksTrustedAddress.externalId
      const network = await this.networkRepository.findByExternalId(
        Provider.FIREBLOCKS,
        fireblocksTrustedAddress.assetId
      )

      if (network) {
        const knownDestination = KnownDestination.parse({
          externalId,
          knownDestinationId: randomUUID(),
          address: fireblocksTrustedAddress.address,
          externalClassification: fireblocksTrustedAddress.externalClassification,
          clientId: connection.clientId,
          label: fireblocksTrustedAddress.label,
          assetId: fireblocksTrustedAddress.assetId,
          provider: Provider.FIREBLOCKS,
          networkId: fireblocksTrustedAddress.assetId,
          createdAt: now,
          updatedAt: now,
          connections: [connection]
        })

        createOperations.push({ type: SyncOperationType.CREATE, create: knownDestination })
      } else {
        createOperations.push({
          type: SyncOperationType.SKIP,
          externalId,
          message: 'Unknown Fireblocks trusted address network ID',
          context: {
            externalId,
            fireblocksNetworkId: fireblocksTrustedAddress.assetId
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

  private transformWhitelistedAddresses(opts: {
    whitelistedWallets: WhitelistedWallet[]
    classification: WhitelistClassification
  }) {
    const now = new Date()
    const destinations = []

    for (const wallet of opts.whitelistedWallets) {
      for (const asset of wallet.assets) {
        destinations.push({
          provider: Provider.FIREBLOCKS,
          externalId: getFireblocksAssetWalletExternalId({
            vaultId: wallet.id,
            assetId: asset.id
          }),
          externalClassification: opts.classification,
          address: asset.address,
          label: wallet.name,
          assetId: asset.id,
          createdAt: now,
          updatedAt: now
        })
      }
    }

    return destinations
  }
}

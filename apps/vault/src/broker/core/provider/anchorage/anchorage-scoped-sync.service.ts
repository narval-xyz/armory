import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { filter, find, flatMap, flow, groupBy, isEmpty, map, uniqBy } from 'lodash/fp'
import { AnchorageClient, Wallet as AnchorageWallet } from '../../../http/client/anchorage.client'
import { UpdateAccount } from '../../../persistence/repository/account.repository'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { WalletRepository } from '../../../persistence/repository/wallet.repository'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address, UpdateWallet, Wallet } from '../../type/indexed-resources.type'
import {
  CreateScopedSyncOperation,
  Provider,
  ProviderScopedSyncService,
  ScopedSyncOperation,
  ScopedSyncOperationType,
  ScopedSyncResult
} from '../../type/provider.type'
import { RawAccount } from '../../type/scoped-sync.type'
import { CONCURRENT_ANCHORAGE_REQUESTS, validateConnection } from './anchorage.util'

@Injectable()
export class AnchorageScopedSyncService implements ProviderScopedSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly networkRepository: NetworkRepository,
    private readonly walletRepository: WalletRepository,
    private readonly logger: LoggerService
  ) {}

  private async fetchRawAccountWallets(
    connection: ConnectionWithCredentials,
    rawAccounts: RawAccount[]
  ): Promise<AnchorageWallet[]> {
    validateConnection(connection)

    const wallets: AnchorageWallet[] = []

    for (let i = 0; i < rawAccounts.length; i += CONCURRENT_ANCHORAGE_REQUESTS) {
      const batch = rawAccounts.slice(i, i + CONCURRENT_ANCHORAGE_REQUESTS)
      const batchPromises = batch.map((rawAccount) =>
        this.anchorageClient.getWallet({
          url: connection.url,
          apiKey: connection.credentials.apiKey,
          signKey: connection.credentials.privateKey,
          walletId: rawAccount.externalId
        })
      )

      const batchResults = await Promise.allSettled(batchPromises)

      const validWallets = batchResults
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            // Handle rejected promises
            const error = result.reason
            const rawAccount = batch[index]

            if (error.response?.status === HttpStatus.NOT_FOUND) {
              this.logger.warn('Anchorage wallet not found', {
                connectionId: connection.connectionId,
                clientId: connection.clientId,
                url: connection.url,
                externalId: rawAccount.externalId
              })
              return null
            }
            throw error
          }
        })
        .filter((wallet): wallet is AnchorageWallet => wallet !== null) as AnchorageWallet[]

      wallets.push(...validWallets)
    }

    return wallets
  }

  async scopedSync(connection: ConnectionWithCredentials, rawAccounts: RawAccount[]): Promise<ScopedSyncResult> {
    const now = new Date()

    this.logger.log('Sync Anchorage accounts', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const existingWallets = await this.walletRepository.findAll(
      { clientId: connection.clientId, connectionId: connection.connectionId },
      { pagination: { disabled: true } }
    )

    const existingWalletMap = new Map(existingWallets.data.map((wallet) => [wallet.externalId, wallet]))
    const existingAccountMap = new Map(
      existingWallets.data.flatMap(
        (wallet) =>
          wallet.accounts?.map((account) => [account.externalId, { ...account, walletId: wallet.walletId }]) ?? []
      )
    )

    // TODO @ptroger: revert that back to 'return empty array' when we completely move towards the scoped connections
    const scopedAnchorageWallets = isEmpty(rawAccounts)
      ? await this.anchorageClient.getWallets({
          url: connection.url,
          apiKey: connection.credentials.apiKey,
          signKey: connection.credentials.privateKey
        })
      : await this.fetchRawAccountWallets(connection, rawAccounts)

    const walletsByVault = groupBy('vaultId', scopedAnchorageWallets)
    const vaultAndWallets = Object.entries(walletsByVault).map(([vaultId, wallets]) => ({
      id: vaultId,
      // All wallets in a vault should have the same vault name
      name: wallets[0].vaultName,
      wallets: wallets.map((wallet) => ({
        walletId: wallet.walletId,
        walletName: wallet.walletName,
        address: {
          address: wallet.depositAddress.address,
          addressId: wallet.depositAddress.addressId
        },
        assets: wallet.assets.map((asset) => ({
          assetType: asset.assetType,
          availableBalance: asset.availableBalance,
          totalBalance: asset.totalBalance,
          stakedBalance: asset.stakedBalance,
          unclaimedBalance: asset.unclaimedBalance
        })),
        networkId: wallet.networkId
      }))
    }))

    const walletOperations: ScopedSyncOperation<Wallet, UpdateWallet>[] = []
    const accountOperations: ScopedSyncOperation<Account, UpdateAccount>[] = []
    const addressOperations: ScopedSyncOperation<Address, never>[] = []

    for (const vault of vaultAndWallets) {
      const existingWallet = existingWalletMap.get(vault.id)
      const walletId = existingWallet?.walletId || randomUUID()

      if (existingWallet) {
        // Check if wallet needs update
        if (existingWallet.label !== vault.name) {
          walletOperations.push({
            type: ScopedSyncOperationType.UPDATE,
            update: {
              clientId: connection.clientId,
              walletId,
              label: vault.name,
              updatedAt: now
            }
          })
        }
      } else {
        // Create new wallet
        walletOperations.push({
          type: ScopedSyncOperationType.CREATE,
          create: {
            accounts: [],
            clientId: connection.clientId,
            connectionId: connection.connectionId,
            createdAt: now,
            externalId: vault.id,
            label: vault.name,
            provider: Provider.ANCHORAGE,
            updatedAt: now,
            walletId
          }
        })
      }

      const vaultAssetTypes = flow(flatMap('assets'), uniqBy('assetType'), map('assetType'))(vault.wallets)

      for (const anchorageWallet of vault.wallets) {
        const existingAccount = existingAccountMap.get(anchorageWallet.walletId)
        const accountId = existingAccount?.accountId || randomUUID()
        const network = await this.networkRepository.findByExternalId(Provider.ANCHORAGE, anchorageWallet.networkId)

        if (network) {
          if (existingAccount) {
            // Check if account needs update
            if (existingAccount.label !== anchorageWallet.walletName) {
              accountOperations.push({
                type: ScopedSyncOperationType.UPDATE,
                update: {
                  clientId: connection.clientId,
                  accountId: existingAccount.accountId,
                  label: anchorageWallet.walletName,
                  updatedAt: now
                }
              })
            }
          } else {
            accountOperations.push({
              type: ScopedSyncOperationType.CREATE,
              create: {
                externalId: anchorageWallet.walletId,
                accountId,
                addresses: [],
                clientId: connection.clientId,
                connectionId: connection.connectionId,
                createdAt: now,
                label: anchorageWallet.walletName,
                networkId: network.networkId,
                provider: Provider.ANCHORAGE,
                updatedAt: now,
                walletId
              }
            })
          }
        } else {
          accountOperations.push({
            type: ScopedSyncOperationType.FAILED,
            externalId: anchorageWallet.walletId,
            message: 'Unknown Anchorage wallet network ID',
            context: {
              externalId: anchorageWallet.walletId,
              anchorageNetworkId: anchorageWallet.networkId
            }
          })
        }
      }

      // Process addresses - Anchorage only creates, no updates
      for (const assetType of vaultAssetTypes) {
        const addresses = await this.anchorageClient.getVaultAddresses({
          signKey: connection.credentials.privateKey,
          apiKey: connection.credentials.apiKey,
          assetType,
          url: connection.url,
          vaultId: vault.id
        })

        for (const address of addresses) {
          const account = flow(
            filter((op: ScopedSyncOperation<Account, UpdateAccount>) => op.type === ScopedSyncOperationType.CREATE),
            find((op: CreateScopedSyncOperation<Account>) => op.create.externalId === address.walletId)
          )(accountOperations)

          const existingAccount = existingAccountMap.get(address.walletId)
          const skipAddress = existingAccount?.addresses?.some((a) => a.externalId === address.addressId)

          const tiedAccount = account?.create?.accountId || existingAccount?.accountId
          if (!skipAddress && tiedAccount) {
            if (account?.create?.accountId || existingAccount?.accountId) {
              addressOperations.push({
                type: ScopedSyncOperationType.CREATE,
                create: {
                  accountId: tiedAccount,
                  address: address.address,
                  addressId: randomUUID(),
                  clientId: connection.clientId,
                  connectionId: connection.connectionId,
                  createdAt: now,
                  externalId: address.addressId,
                  provider: Provider.ANCHORAGE,
                  updatedAt: now
                }
              })
            } else {
              addressOperations.push({
                type: ScopedSyncOperationType.FAILED,
                externalId: address.addressId,
                message: 'Unknown Anchorage wallet address',
                context: {
                  externalId: address.addressId,
                  address: address.address,
                  walletId: address.walletId
                }
              })
            }
          }
        }
      }
    }

    return {
      wallets: walletOperations,
      accounts: accountOperations,
      addresses: addressOperations
    }
  }
}

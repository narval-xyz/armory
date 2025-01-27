import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { uniqBy } from 'lodash/fp'
import { FIREBLOCKS_API_ERROR_CODES, FireblocksClient, VaultAccount } from '../../../http/client/fireblocks.client'
import { UpdateAccount } from '../../../persistence/repository/account.repository'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { WalletRepository } from '../../../persistence/repository/wallet.repository'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address, UpdateWallet, Wallet } from '../../type/indexed-resources.type'
import {
  Provider,
  ProviderScopedSyncService,
  ScopedSyncOperation,
  ScopedSyncOperationType,
  ScopedSyncResult
} from '../../type/provider.type'
import { RawAccount } from '../../type/scoped-sync.type'
import {
  CONCURRENT_FIREBLOCKS_REQUESTS,
  FireblocksAssetWalletId,
  getFireblocksAssetAddressExternalId,
  getFireblocksAssetWalletExternalId,
  toFireblocksAssetWalletExternalId,
  validateConnection
} from './fireblocks.util'

@Injectable()
export class FireblocksScopedSyncService implements ProviderScopedSyncService {
  constructor(
    private readonly fireblocksClient: FireblocksClient,
    private readonly networkRepository: NetworkRepository,
    private readonly walletRepository: WalletRepository,
    private readonly logger: LoggerService
  ) {}

  private async buildVaultNetworkMap(
    assetWalletIds: FireblocksAssetWalletId[]
  ): Promise<Record<string, Set<{ narvalNetworkId: string; fireblocksNetworkId: string }>>> {
    const result: Record<string, Set<{ narvalNetworkId: string; fireblocksNetworkId: string }>> = {}

    for (const { vaultId, networkId } of assetWalletIds) {
      if (!vaultId || !networkId) continue

      try {
        const network = await this.networkRepository.findById(networkId)

        if (!network) {
          this.logger.log('Network not found', { networkId })
          continue
        }

        const fireblocksNetwork = network.externalNetworks?.find((n) => n.provider === Provider.FIREBLOCKS)
        if (!fireblocksNetwork) {
          this.logger.log('Network not supported', { networkId, provider: Provider.FIREBLOCKS })
          continue
        }

        if (!result[vaultId]) {
          result[vaultId] = new Set()
        }
        result[vaultId].add({
          narvalNetworkId: networkId,
          fireblocksNetworkId: fireblocksNetwork.externalId
        })
      } catch (error) {
        this.logger.log('Error processing network', { networkId, error: String(error) })
      }
    }

    return result
  }

  async scopedSync(connection: ConnectionWithCredentials, rawAccounts: RawAccount[]): Promise<ScopedSyncResult> {
    const now = new Date()
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

    const assetWalletIds = uniqBy('externalId', rawAccounts).map((account) =>
      toFireblocksAssetWalletExternalId(account.externalId)
    )

    const vaultToNetworkMap = await this.buildVaultNetworkMap(assetWalletIds)
    const requestedVaultIds = Object.keys(vaultToNetworkMap)

    const vaults: VaultAccount[] = []
    for (let i = 0; i < Object.keys(vaultToNetworkMap).length; i += CONCURRENT_FIREBLOCKS_REQUESTS) {
      const batch = Object.keys(vaultToNetworkMap).slice(i, i + CONCURRENT_FIREBLOCKS_REQUESTS)
      const batchPromises = batch.map((vaultId) =>
        this.fireblocksClient.getVaultAccount({
          apiKey: connection.credentials.apiKey,
          signKey: connection.credentials.privateKey,
          url: connection.url,
          vaultAccountId: vaultId
        })
      )

      const batchResults = await Promise.allSettled(batchPromises)

      const validVaults = batchResults
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            const error = result.reason
            const vaultId = batch[index]

            if (error?.response?.body?.code === FIREBLOCKS_API_ERROR_CODES.INVALID_SPECIFIED_VAULT_ACCOUNT) {
              this.logger.warn('Vault not found', {
                vaultId,
                provider: Provider.FIREBLOCKS
              })
              return null
            } else {
              throw error
            }
          }
        })
        .filter((vault): vault is VaultAccount => vault !== null)

      vaults.push(...validVaults)
    }

    // Filter to only get the vaults we need based on vaultToNetworkMap
    const relevantVaults = vaults.filter((vault) => vault.id in vaultToNetworkMap)
    const vaultMap = Object.fromEntries(relevantVaults.map((vault) => [vault.id, vault]))

    // Log each missing vault
    const foundVaultIds = relevantVaults.map((vault) => vault.id)
    requestedVaultIds.forEach((vaultId) => {
      if (!foundVaultIds.includes(vaultId)) {
        this.logger.warn('Vault not found', {
          vaultId,
          networks: vaultToNetworkMap[vaultId]
        })
      }
    })

    const walletOperations: ScopedSyncOperation<Wallet, UpdateWallet>[] = []
    const accountOperations: ScopedSyncOperation<Account, UpdateAccount>[] = []
    const addressOperations: ScopedSyncOperation<Address, never>[] = []

    for (const [vaultId, networkIds] of Object.entries(vaultToNetworkMap)) {
      const vault = vaultMap[vaultId]
      if (!vault) {
        this.logger.warn('raw account was not found', { vaultId })
        continue
      }
      const existingWallet = existingWalletMap.get(vaultId)
      const walletId = existingWallet?.walletId || randomUUID()

      if (existingWallet) {
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
        walletOperations.push({
          type: ScopedSyncOperationType.CREATE,
          create: {
            accounts: [],
            clientId: connection.clientId,
            connectionId: connection.connectionId,
            createdAt: now,
            externalId: vaultId,
            label: vault.name,
            provider: Provider.FIREBLOCKS,
            updatedAt: now,
            walletId
          }
        })
      }

      // Create accounts for each network
      for (const { fireblocksNetworkId, narvalNetworkId } of networkIds) {
        const accountExternalId = getFireblocksAssetWalletExternalId({
          vaultId: vault.id,
          networkId: fireblocksNetworkId
        })

        const existingAccount = existingAccountMap.get(accountExternalId)
        const accountId = existingAccount?.accountId || randomUUID()
        const accountLabel = `${vault.name} - ${fireblocksNetworkId}`

        try {
          if (existingAccount) {
            if (existingAccount.label !== accountLabel) {
              accountOperations.push({
                type: ScopedSyncOperationType.UPDATE,
                update: {
                  clientId: connection.clientId,
                  accountId: existingAccount.accountId,
                  label: accountLabel,
                  updatedAt: now
                }
              })
            }
          } else {
            accountOperations.push({
              type: ScopedSyncOperationType.CREATE,
              create: {
                externalId: accountExternalId,
                accountId,
                addresses: [],
                clientId: connection.clientId,
                createdAt: now,
                connectionId: connection.connectionId,
                label: accountLabel,
                networkId: narvalNetworkId,
                provider: Provider.FIREBLOCKS,
                updatedAt: now,
                walletId
              }
            })
          }

          // Fetch and process addresses
          try {
            const addresses = await this.fireblocksClient.getAddresses({
              apiKey: connection.credentials.apiKey,
              signKey: connection.credentials.privateKey,
              url: connection.url,
              vaultAccountId: vault.id,
              assetId: fireblocksNetworkId
            })
            addresses.forEach((address) => {
              const addressExternalId = getFireblocksAssetAddressExternalId({
                vaultId: vault.id,
                networkId: fireblocksNetworkId,
                address: address.address
              })
              if (!existingAccount?.addresses?.some((a) => a.externalId === addressExternalId)) {
                addressOperations.push({
                  type: ScopedSyncOperationType.CREATE,
                  create: {
                    accountId,
                    address: address.address,
                    addressId: randomUUID(),
                    clientId: connection.clientId,
                    createdAt: now,
                    connectionId: connection.connectionId,
                    externalId: addressExternalId,
                    provider: Provider.FIREBLOCKS,
                    updatedAt: now
                  }
                })
              }
            })
          } catch (error) {
            addressOperations.push({
              type: ScopedSyncOperationType.FAILED,
              externalId: accountExternalId,
              message: 'Failed to fetch addresses',
              context: { error: error.message }
            })
          }
        } catch (error) {
          accountOperations.push({
            type: ScopedSyncOperationType.FAILED,
            externalId: accountExternalId,
            message: 'Failed to process account',
            context: { error: error.message }
          })
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

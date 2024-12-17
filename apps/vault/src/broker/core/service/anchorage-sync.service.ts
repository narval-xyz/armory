import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import { uniq } from 'lodash'
import { v4 as uuid } from 'uuid'
import { AnchorageClient } from '../../http/client/anchorage.client'
import { BrokerException } from '../exception/broker.exception'
import { ConnectionInvalidException } from '../exception/connection-invalid.exception'
import { ActiveConnection, ActiveConnectionWithCredentials, Provider } from '../type/connection.type'
import { Account, Address, Wallet } from '../type/indexed-resources.type'
import { AccountService } from './account.service'
import { AddressService } from './address.service'
import { WalletService } from './wallet.service'

@Injectable()
export class AnchorageSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly logger: LoggerService
  ) {}

  async sync(connection: ActiveConnectionWithCredentials): Promise<void> {
    await this.syncWallets(connection)
    await this.syncAccounts(connection)
    await this.syncAddresses(connection)
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

    const existingWallets = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageVaults.map((vault) => vault.vaultId)
      }
    })

    const existingWalletByExternalId = new Map(existingWallets.map((wallet) => [wallet.externalId, wallet]))

    const missingAnchorageVaults = anchorageVaults.filter(
      (anchorageVault) => !existingWalletByExternalId.has(anchorageVault.vaultId)
    )

    const now = new Date()

    const wallets: Wallet[] = missingAnchorageVaults.map((vault) => ({
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

    await this.walletService.bulkCreate(wallets)

    return wallets
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

    const existingWallets = await this.walletService.findAll(connection.clientId, {
      filters: {
        externalIds: walletExternalIds
      }
    })

    const existingAccounts = await this.accountService.findAll(connection.clientId, {
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
        throw new BrokerException({
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

    await this.accountService.bulkCreate(accounts)

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
    const existingAccounts = await this.accountService.findAll(connection.clientId, {
      filters: {
        externalIds: anchorageAddresses.map((anchorageAddress) => anchorageAddress.walletId)
      }
    })

    const existingAccountsByExternalId = new Map(existingAccounts.map((account) => [account.externalId, account]))

    const existingAddresses = await this.addressService.findAll(connection.clientId, {
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

      throw new BrokerException({
        message: 'Anchorage address parent account not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    })

    await this.addressService.bulkCreate(addresses)

    return addresses
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

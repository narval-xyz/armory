import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { chunk, uniqBy } from 'lodash/fp'
import { AnchorageClient, Wallet as AnchorageWallet } from '../../../http/client/anchorage.client'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address, Wallet } from '../../type/indexed-resources.type'
import { NetworkMap } from '../../type/network.type'
import { Provider, ProviderScopedSyncService } from '../../type/provider.type'
import {
  RawAccount,
  RawAccountError,
  RawAccountSyncFailure,
  ScopedSyncContext,
  ScopedSyncResult
} from '../../type/scoped-sync.type'
import { CONCURRENT_ANCHORAGE_REQUESTS, ValidConnection, validateConnection } from './anchorage.util'

type RawAccountSyncSuccess = {
  success: true
  wallet: Wallet
  account: Account
  address: Address
}

type RawAccountSyncFailed = {
  success: false
  failure: RawAccountSyncFailure
}

type RawAccountSyncResult = RawAccountSyncSuccess | RawAccountSyncFailed

@Injectable()
export class AnchorageScopedSyncService implements ProviderScopedSyncService {
  constructor(
    private readonly anchorageClient: AnchorageClient,
    private readonly logger: LoggerService
  ) {}

  private resolveFailure(failure: RawAccountSyncFailure): RawAccountSyncFailed {
    this.logger.log('Failed to sync Raw Account', failure)
    return { success: false, failure }
  }

  private resolveSuccess({
    rawAccount,
    wallet,
    account,
    address
  }: {
    wallet: Wallet
    address: Address
    rawAccount: RawAccount
    account: Account
  }): RawAccountSyncSuccess {
    this.logger.log('Successfully fetched and map Raw Account', {
      rawAccount,
      account
    })
    return {
      success: true,
      wallet,
      account,
      address
    }
  }

  private mapAnchorageWalletToNarvalModel(
    anchorageWallet: AnchorageWallet,
    {
      networks,
      now,
      existingAccounts,
      rawAccount,
      connection,
      existingWallets
    }: {
      networks: NetworkMap
      now: Date
      existingAccounts: Account[]
      existingWallets: Wallet[]
      rawAccount: RawAccount
      connection: ValidConnection
    }
  ): RawAccountSyncResult {
    const network = networks.get(anchorageWallet.networkId)
    if (!network) {
      this.logger.error('Network not found', {
        rawAccount,
        externalNetwork: anchorageWallet.networkId
      })
      return this.resolveFailure({
        rawAccount,
        message: 'Network for this account is not supported',
        code: RawAccountError.UNLISTED_NETWORK,
        networkId: anchorageWallet.networkId
      })
    }
    const existingAccount = existingAccounts.find((a) => a.externalId === anchorageWallet.walletId)
    const existingWallet = existingWallets.find((w) => w.externalId === anchorageWallet.vaultId)

    const walletId = existingWallet?.walletId || existingAccount?.walletId || randomUUID()
    const accountId = existingAccount?.accountId || randomUUID()

    const wallet: Wallet = {
      accounts: [],
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: now,
      externalId: anchorageWallet.vaultId,
      label: anchorageWallet.walletName,
      provider: Provider.ANCHORAGE,
      updatedAt: now,
      walletId
    }

    const account: Account = {
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

    const address: Address = {
      accountId,
      address: anchorageWallet.depositAddress.address,
      addressId: randomUUID(),
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: now,
      externalId: anchorageWallet.depositAddress.addressId,
      provider: Provider.ANCHORAGE,
      updatedAt: now
    }

    return this.resolveSuccess({ rawAccount, wallet, account, address })
  }

  private async syncRawAccount({
    connection,
    rawAccount,
    networks,
    now,
    existingAccounts,
    existingWallets
  }: {
    connection: ConnectionWithCredentials
    rawAccount: RawAccount
    networks: NetworkMap
    now: Date
    existingAccounts: Account[]
    existingWallets: Wallet[]
  }): Promise<RawAccountSyncResult> {
    validateConnection(connection)

    try {
      const anchorageWallet = await this.anchorageClient.getWallet({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey,
        walletId: rawAccount.externalId
      })

      return this.mapAnchorageWalletToNarvalModel(anchorageWallet, {
        networks,
        now,
        existingAccounts,
        rawAccount,
        connection,
        existingWallets
      })
    } catch (error) {
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        return this.resolveFailure({
          rawAccount,
          message: 'Anchorage wallet not found',
          code: RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND,
          externalResourceType: 'wallet',
          externalResourceId: rawAccount.externalId
        })
      }
      throw error
    }
  }

  async scopeSync({
    connection,
    rawAccounts,
    networks,
    existingAccounts
  }: ScopedSyncContext): Promise<ScopedSyncResult> {
    this.logger.log('Sync Anchorage accounts', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    const now = new Date()

    const chunkedRawAccounts = chunk(CONCURRENT_ANCHORAGE_REQUESTS, rawAccounts)
    const results: RawAccountSyncResult[] = []

    // TODO @ptroger: remove the if block when we completely move towards picking accounts in UI
    if (rawAccounts.length === 0) {
      validateConnection(connection)

      const anchorageWallets = await this.anchorageClient.getWallets({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      const existingWallets: Wallet[] = []
      const mappedAnchorageWallets = anchorageWallets.map((anchorageWallet) => {
        const map = this.mapAnchorageWalletToNarvalModel(anchorageWallet, {
          networks,
          now,
          existingAccounts,
          rawAccount: { provider: Provider.ANCHORAGE, externalId: anchorageWallet.walletId },
          connection,
          existingWallets
        })
        map.success && existingWallets.push(map.wallet)
        return map
      })

      results.push(...mappedAnchorageWallets)
    } else {
      const existingWallets: Wallet[] = []
      for (const chunk of chunkedRawAccounts) {
        const chunkResults = await Promise.all(
          chunk.map(async (rawAccount) => {
            const mapResult = await this.syncRawAccount({
              connection,
              rawAccount,
              networks,
              now,
              existingAccounts,
              existingWallets
            })
            mapResult.success && existingWallets.push(mapResult.wallet)
            return mapResult
          })
        )
        results.push(...chunkResults)
      }
    }

    const wallets: Wallet[] = []
    const accounts: Account[] = []
    const addresses: Address[] = []
    const failures: RawAccountSyncFailure[] = []

    for (const result of results) {
      if (result.success) {
        wallets.push(result.wallet)
        accounts.push(result.account)
        addresses.push(result.address)
      } else {
        failures.push(result.failure)
      }
    }

    return {
      wallets: uniqBy('externalId', wallets),
      accounts: uniqBy('externalId', accounts),
      addresses: uniqBy('externalId', addresses),
      failures
    }
  }
}

import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { chunk, uniqBy } from 'lodash/fp'
import { FIREBLOCKS_API_ERROR_CODES, FireblocksClient, VaultAccount } from '../../../http/client/fireblocks.client'
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
import {
  CONCURRENT_FIREBLOCKS_REQUESTS,
  buildFireblocksAssetAddressExternalId,
  parseFireblocksAssetWalletExternalId,
  validateConnection
} from './fireblocks.util'
type RawAccountSyncSuccess = {
  success: true
  wallet: Wallet
  account: Account
  addresses: Address[]
}

type RawAccountSyncFailed = {
  success: false
  failure: RawAccountSyncFailure
}

type RawAccountSyncResult = RawAccountSyncSuccess | RawAccountSyncFailed

@Injectable()
export class FireblocksScopedSyncService implements ProviderScopedSyncService {
  constructor(
    private readonly fireblocksClient: FireblocksClient,
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
    addresses
  }: {
    wallet: Wallet
    addresses: Address[]
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
      addresses
    }
  }
  private async resolveRawAccount({
    connection,
    rawAccount,
    networks,
    now,
    existingAccounts,
    existingAddresses,
    vaultAccount,
    existingWallets
  }: {
    connection: ConnectionWithCredentials
    rawAccount: RawAccount
    networks: NetworkMap
    now: Date
    existingAccounts: Account[]
    vaultAccount: VaultAccount
    existingWallets: Wallet[]
    existingAddresses: Address[]
  }): Promise<RawAccountSyncResult> {
    validateConnection(connection)
    const { vaultId, baseAssetId: networkId } = parseFireblocksAssetWalletExternalId(rawAccount.externalId)
    const network = networks.get(networkId)

    if (!network) {
      this.logger.error('Network not found', {
        rawAccount,
        externalNetwork: networkId
      })
      return this.resolveFailure({
        rawAccount,
        message: 'Network for this account is not supported',
        code: RawAccountError.UNLISTED_NETWORK,
        networkId
      })
    }

    const existingAccount = existingAccounts.find((a) => a.externalId === rawAccount.externalId)
    const existingWallet = existingWallets.find((a) => a.externalId === vaultId)

    const accountLabel = `${vaultAccount.name} - ${networkId}`
    const accountId = existingAccount?.accountId || randomUUID()
    const walletId = existingWallet?.walletId || existingAccount?.walletId || randomUUID()
    const fireblocksAddresses = await this.fireblocksClient.getAddresses({
      apiKey: connection.credentials.apiKey,
      signKey: connection.credentials.privateKey,
      url: connection.url,
      vaultAccountId: vaultId,
      assetId: networkId
    })

    const wallet: Wallet = {
      accounts: [],
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: now,
      externalId: vaultId,
      label: vaultAccount.name,
      provider: Provider.FIREBLOCKS,
      updatedAt: now,
      walletId
    }

    const account: Account = {
      externalId: rawAccount.externalId,
      accountId,
      addresses: [],
      clientId: connection.clientId,
      createdAt: now,
      connectionId: connection.connectionId,
      label: accountLabel,
      networkId: network.networkId,
      provider: Provider.FIREBLOCKS,
      updatedAt: now,
      walletId
    }

    const addresses: Address[] = fireblocksAddresses
      .map((a) => {
        const addressExternalId = buildFireblocksAssetAddressExternalId({
          vaultId,
          networkId,
          address: a.address
        })
        const existingAddress = existingAddresses.find((a) => a.externalId === addressExternalId)
        if (!existingAddress) {
          return {
            accountId,
            address: a.address,
            addressId: randomUUID(),
            clientId: connection.clientId,
            createdAt: now,
            connectionId: connection.connectionId,
            externalId: addressExternalId,
            provider: Provider.FIREBLOCKS,
            updatedAt: now
          }
        }
        return null
      })
      .filter((a) => a !== null) as Address[]

    return this.resolveSuccess({
      rawAccount,
      wallet,
      account,
      addresses
    })
  }

  private async fetchVaultAccount({
    connection,
    rawAccount
  }: {
    connection: ConnectionWithCredentials
    rawAccount: RawAccount
  }): Promise<{ vaultAccount: VaultAccount; rawAccount: RawAccount } | RawAccountSyncFailed> {
    validateConnection(connection)
    const { vaultId } = parseFireblocksAssetWalletExternalId(rawAccount.externalId)
    try {
      const vaultAccount = await this.fireblocksClient.getVaultAccount({
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey,
        url: connection.url,
        vaultAccountId: vaultId
      })

      return { vaultAccount, rawAccount }
    } catch (error) {
      if (error?.response?.body?.code === FIREBLOCKS_API_ERROR_CODES.INVALID_SPECIFIED_VAULT_ACCOUNT) {
        return this.resolveFailure({
          rawAccount,
          message: 'Fireblocks Vault Account not found',
          code: RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND,
          externalResourceType: 'vaultAccount',
          externalResourceId: vaultId
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
    validateConnection(connection)

    const now = new Date()

    const chunkedRawAccounts = chunk(CONCURRENT_FIREBLOCKS_REQUESTS, rawAccounts)
    const fetchResults = []

    for (const currentChunk of chunkedRawAccounts) {
      const chunkResults = await Promise.all(
        currentChunk.map((rawAccount) => this.fetchVaultAccount({ connection, rawAccount }))
      )
      fetchResults.push(...chunkResults)
    }

    const wallets: Wallet[] = []
    const accounts: Account[] = []
    const addresses: Address[] = []
    const failures: RawAccountSyncFailure[] = []

    for (const result of fetchResults) {
      if ('success' in result && !result.success) {
        failures.push(result.failure)
        continue
      } else if ('rawAccount' in result) {
        const mappedResult = await this.resolveRawAccount({
          connection,
          rawAccount: result.rawAccount,
          networks,
          now,
          existingAccounts: [...existingAccounts, ...accounts],
          existingWallets: wallets,
          existingAddresses: addresses,
          vaultAccount: result.vaultAccount
        })
        if (mappedResult.success) {
          wallets.push(mappedResult.wallet)
          accounts.push(mappedResult.account)
          addresses.push(...mappedResult.addresses)
        } else {
          failures.push(mappedResult.failure)
        }
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

import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { chunk, uniqBy } from 'lodash/fp'
import { BitGoWallet, BitgoClient } from '../../../http/client/bitgo.client'
import { ConnectionWithCredentials } from '../../type/connection.type'
import { Account, Address } from '../../type/indexed-resources.type'
import { NetworkMap } from '../../type/network.type'
import { Provider, ProviderScopedSyncService } from '../../type/provider.type'
import {
  RawAccount,
  RawAccountError,
  RawAccountSyncFailure,
  ScopedSyncContext,
  ScopedSyncResult
} from '../../type/scoped-sync.type'
import { CONCURRENT_BITGO_REQUEST, validateConnection } from './bitgo.util'

type RawAccountSyncSuccess = {
  success: true
  account: Account
  address: Address
}

type RawAccountSyncFailed = {
  success: false
  failure: RawAccountSyncFailure
}

type RawAccountSyncResult = RawAccountSyncSuccess | RawAccountSyncFailed

@Injectable()
export class BitgoScopedSyncService implements ProviderScopedSyncService {
  constructor(
    private readonly bitgoClient: BitgoClient,
    private readonly logger: LoggerService
  ) {}

  private resolveFailure(failure: RawAccountSyncFailure): RawAccountSyncFailed {
    this.logger.log('Failed to sync Raw Account', failure)
    return { success: false, failure }
  }

  private resolveSuccess({
    rawAccount,
    account,
    address
  }: {
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
      account,
      address
    }
  }

  syncRawAccount({
    rawAccount,
    networks,
    bitgoWallet,
    connection,
    now,
    existingAccounts
  }: {
    rawAccount: RawAccount
    networks: NetworkMap
    bitgoWallet: BitGoWallet
    connection: ConnectionWithCredentials
    now: Date
    existingAccounts: Account[]
  }): RawAccountSyncResult {
    const network = networks.get(bitgoWallet.coin.toUpperCase())

    if (!network) {
      return this.resolveFailure({
        rawAccount,
        message: 'Network not found',
        code: RawAccountError.UNLISTED_NETWORK,
        networkId: bitgoWallet.coin
      })
    }

    const addressObj = bitgoWallet.receiveAddress
    const existingAcc = existingAccounts.find((a) => a.externalId === bitgoWallet.id)
    const accountId = existingAcc?.accountId || randomUUID()

    const account: Account = {
      externalId: bitgoWallet.id,
      accountId,
      addresses: [],
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: now,
      label: bitgoWallet.label,
      networkId: network.networkId,
      provider: Provider.BITGO,
      updatedAt: now,
      walletId: null // BitGo doesn't have a concept that maps to our "wallet"
    }

    const address: Address = {
      accountId,
      address: addressObj.address,
      addressId: randomUUID(),
      clientId: connection.clientId,
      connectionId: connection.connectionId,
      createdAt: now,
      externalId: addressObj.id,
      provider: Provider.BITGO,
      updatedAt: now
    }

    return this.resolveSuccess({
      rawAccount,
      account,
      address
    })
  }

  async scopeSync({
    connection,
    rawAccounts,
    networks,
    existingAccounts
  }: ScopedSyncContext): Promise<ScopedSyncResult> {
    const now = new Date()

    this.logger.log('Sync BitGo accounts', {
      connectionId: connection.connectionId,
      clientId: connection.clientId,
      url: connection.url
    })

    validateConnection(connection)

    const bitgoWallets = await this.bitgoClient.getWallets({
      url: connection.url,
      apiKey: connection.credentials.apiKey,
      options: {
        walletIds: rawAccounts.map((account) => account.externalId)
      }
    })

    const accounts: Account[] = []
    const addresses: Address[] = []
    const failures: RawAccountSyncFailure[] = []

    const chunkedRawAccounts = chunk(CONCURRENT_BITGO_REQUEST, rawAccounts)
    const results = []

    for (const chunk of chunkedRawAccounts) {
      const chunkResults = await Promise.all(
        chunk.map((rawAccount) => {
          const bitgoWallet = bitgoWallets.find((b) => b.id === rawAccount.externalId)

          if (!bitgoWallet) {
            return this.resolveFailure({
              rawAccount,
              message: 'BitGo wallet not found',
              code: RawAccountError.EXTERNAL_RESOURCE_NOT_FOUND,
              externalResourceId: rawAccount.externalId,
              externalResourceType: 'wallet'
            })
          }
          return this.syncRawAccount({ connection, rawAccount, networks, bitgoWallet, now, existingAccounts })
        })
      )
      results.push(...chunkResults)
    }

    for (const result of results) {
      if (result.success) {
        accounts.push(result.account)
        addresses.push(result.address)
      } else {
        failures.push(result.failure)
      }
    }

    return {
      wallets: [],
      accounts: uniqBy('externalId', accounts),
      addresses: uniqBy('externalId', addresses),
      failures
    }
  }
}

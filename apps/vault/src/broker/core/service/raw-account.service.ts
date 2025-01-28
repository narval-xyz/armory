import { LoggerService, PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { z } from 'zod'
import { AnchorageClient } from '../../http/client/anchorage.client'
import { FireblocksClient } from '../../http/client/fireblocks.client'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { AssetRepository } from '../../persistence/repository/asset.repository'
import { NetworkRepository } from '../../persistence/repository/network.repository'
import { BrokerException } from '../exception/broker.exception'
import { validateConnection as validateAnchorageConnection } from '../provider/anchorage/anchorage.util'
import { validateConnection as validateFireblocksConnection } from '../provider/fireblocks/fireblocks.util'
import { Asset } from '../type/asset.type'
import { Network } from '../type/network.type'
import { Provider } from '../type/provider.type'
import { ConnectionService } from './connection.service'

export const RawAccount = z.object({
  provider: z.nativeEnum(Provider),
  externalId: z.string(),
  label: z.string(),
  subLabel: z.string().optional(),
  defaultAddress: z.string().optional().describe('The deposit address for the account, if there are multiple'),
  network: Network.nullish().describe('The network of the account'),
  assets: z
    .array(
      z.object({
        asset: Asset,
        balance: z.string().optional().describe('The balance of the this asset in this account')
      })
    )
    .optional()
    .describe('The assets of the account')
})
export type RawAccount = z.infer<typeof RawAccount>

type FindAllOptions = {
  filters?: {
    networkId?: string
    assetId?: string
    namePrefix?: string
    nameSuffix?: string
    includeAddress?: boolean
  }
  pagination?: PaginationOptions
}

@Injectable()
export class RawAccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly connectionService: ConnectionService,
    private readonly networkRepository: NetworkRepository,
    private readonly assetRepository: AssetRepository,
    private readonly anchorageClient: AnchorageClient,
    private readonly fireblocksClient: FireblocksClient,
    private readonly loggerService: LoggerService
  ) {}

  async findAllPaginated(
    clientId: string,
    connectionId: string,
    options?: FindAllOptions
  ): Promise<PaginatedResult<RawAccount>> {
    const connection = await this.connectionService.findWithCredentialsById(clientId, connectionId)

    const assetFilter = options?.filters?.assetId
      ? await this.assetRepository.findById(options.filters.assetId)
      : undefined
    const networkFilter = options?.filters?.networkId
      ? await this.networkRepository.findById(options.filters.networkId)
      : undefined

    if (connection.provider === Provider.ANCHORAGE) {
      validateAnchorageConnection(connection)
      const wallets = await this.anchorageClient.getWallets({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey
      })

      // Anchorage doesn't have filtering, so we fetch everything & then filter in-memory.
      // TODO: add caching to make this faster for repeat queries.
      const rawAccounts = await Promise.all(
        wallets.map(async (wallet) => ({
          provider: Provider.ANCHORAGE,
          externalId: wallet.walletId,
          label: wallet.walletName,
          subLabel: wallet.vaultName,
          defaultAddress: wallet.depositAddress.address,
          network: await this.networkRepository.findByExternalId(Provider.ANCHORAGE, wallet.networkId),
          assets: await Promise.all(
            wallet.assets.map(async (a) => ({
              asset: await this.assetRepository.findByExternalId(Provider.ANCHORAGE, a.assetType),
              balance: a.totalBalance?.quantity
            }))
          ).then((a) => a.filter((a) => !!a.asset))
        }))
      )

      // Filter the raw accounts based on the filters
      const filteredRawAccounts = rawAccounts.filter((a) => {
        let matches = true
        if (networkFilter) {
          matches = a.network?.networkId === networkFilter.networkId
          if (!matches) return false
        }
        if (assetFilter) {
          matches = a.assets?.some((a) => a.asset?.assetId === assetFilter.assetId)
          if (!matches) return false
        }
        if (options?.filters?.namePrefix) {
          matches = a.label.toLowerCase().startsWith(options.filters.namePrefix.toLowerCase())
          if (!matches) return false
        }
        if (options?.filters?.nameSuffix) {
          matches = a.subLabel.toLowerCase().endsWith(options.filters.nameSuffix.toLowerCase())
          if (!matches) return false
        }
        return true
      })

      return {
        data: filteredRawAccounts.map((a) => RawAccount.parse(a))
      }
    } else if (connection.provider === Provider.FIREBLOCKS) {
      validateFireblocksConnection(connection)
      let fbNetworkFilter: string | undefined
      if (networkFilter) {
        // Fireblocks doesn't have network filtering, so we'll find the base asset for the network and filter by that.
        const baseAsset = await this.assetRepository.findNative(networkFilter.networkId)
        fbNetworkFilter = baseAsset?.externalAssets.find((a) => a.provider === Provider.FIREBLOCKS)?.externalId
        if (!fbNetworkFilter) {
          throw new BrokerException({
            message: 'Fireblocks does not support this network',
            suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
            context: {
              networkId: networkFilter.networkId
            }
          })
        }
      }
      const fbAssetFilter =
        assetFilter?.externalAssets.find((a) => a.provider === Provider.FIREBLOCKS)?.externalId || fbNetworkFilter
      const response = await this.fireblocksClient.getVaultAccountsV2({
        url: connection.url,
        apiKey: connection.credentials.apiKey,
        signKey: connection.credentials.privateKey,
        options: {
          namePrefix: options?.filters?.namePrefix,
          nameSuffix: options?.filters?.nameSuffix,
          limit: options?.pagination?.take,
          after: options?.pagination?.cursor?.id, // TODO: Our cursor has too strict of typing, it can't pass-through
          assetId: fbAssetFilter
        }
      })
      // In Fireblocks, a VaultAccount is not network-specific, so we'll map the AssetWallets to get what we call "Accounts"
      const rawAccounts = await Promise.all(
        response.accounts.map(async (account) => {
          const assets = await Promise.all(
            account.assets
              .filter((a) => !a.hiddenOnUI)
              .map(async (asset) => ({
                assetId: asset.id,
                balance: asset.available,
                asset: await this.assetRepository.findByExternalId(Provider.FIREBLOCKS, asset.id)
              }))
          )
          // Group assets by network
          const assetsByNetwork = assets.reduce(
            (acc, asset) => {
              if (!asset.asset?.networkId) return acc // Skip assets without a networkId
              if (!acc[asset.asset.networkId]) {
                acc[asset.asset.networkId] = []
              }
              acc[asset.asset.networkId].push(asset)
              return acc
            },
            {} as Record<string, typeof assets>
          )

          // Create an account for each network that has assets
          return await Promise.all(
            Object.entries(assetsByNetwork).map(async ([networkId, networkAssets]) => {
              const network = await this.networkRepository.findById(networkId)
              return {
                provider: Provider.FIREBLOCKS,
                externalId: `${account.id}-${networkId}`,
                label: account.name || account.id,
                subLabel: networkId,
                defaultAddress: '', // Fireblocks doesn't provide a default address at account level
                network,
                assets: networkAssets
                  .map((a) =>
                    a.asset
                      ? {
                          asset: a.asset,
                          balance: a.balance
                        }
                      : undefined
                  )
                  .filter((a) => !!a)
              }
            })
          )
        })
      ).then((a) => a.flat())

      // Fetch the Address for the Base Asset
      const rawAccountsWithAddresses = await Promise.all(
        rawAccounts.map(async (account) => {
          if (!account.network) return account

          // Get the fireblocks base asset for the network
          const fireblocksBaseAsset = await this.assetRepository
            .findNative(account.network?.networkId)
            .then((a) => a?.externalAssets.find((a) => a.provider === Provider.FIREBLOCKS)?.externalId)
          if (!fireblocksBaseAsset) return account

          // Fetch the base asset addresses.
          const addresses = options?.filters?.includeAddress
            ? await this.fireblocksClient.getAddresses({
                url: connection.url,
                apiKey: connection.credentials.apiKey,
                signKey: connection.credentials.privateKey,
                vaultAccountId: account.externalId.split('-')[0],
                assetId: fireblocksBaseAsset
              })
            : []
          return {
            ...account,
            defaultAddress: addresses[0]?.address || undefined
          }
        })
      )

      return {
        data: rawAccountsWithAddresses.map((account) => RawAccount.parse(account)) // TODO: don't re-do the parse. It's an asset typedef because the .filter isn't inferred that it's no longer nullable.
      }
    }

    throw new BrokerException({
      message: 'Unsupported provider',
      suggestedHttpStatusCode: HttpStatus.NOT_IMPLEMENTED,
      context: {
        provider: connection.provider
      }
    })
  }
}

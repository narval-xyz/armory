import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey } from '@narval/signature'
import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { EMPTY, Observable, catchError, expand, lastValueFrom, map, reduce, tap } from 'rxjs'
import { z } from 'zod'
import { ProxyRequestException } from '../../core/exception/proxy-request.exception'
import { BuildAnchorageRequestParams, buildAnchorageSignedRequest } from '../../core/lib/anchorage-request-builder'

const Amount = z.object({
  quantity: z.string(),
  assetType: z.string(),
  currentPrice: z.string(),
  currentUSDValue: z.string()
})

const DepositAddress = z.object({
  address: z.string(),
  addressId: z.string(),
  addressSignaturePayload: z.string(),
  signature: z.string()
})

const VaultAsset = z.object({
  walletId: z.string(),
  assetType: z.string(),
  availableBalance: Amount.optional(),
  totalBalance: Amount.optional(),
  stakedBalance: Amount.optional(),
  unclaimedBalance: Amount.optional(),
  vaultId: z.string(),
  vaultName: z.string()
})

const Vault = z.object({
  vaultId: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.literal('VAULT'),
  accountName: z.string(),
  assets: z.array(VaultAsset)
})
type Vault = z.infer<typeof Vault>

const WalletAsset = z.object({
  assetType: z.string(),
  availableBalance: Amount.optional(),
  totalBalance: Amount.optional(),
  stakedBalance: Amount.optional(),
  unclaimedBalance: Amount.optional()
})

const Wallet = z.object({
  walletId: z.string(),
  walletName: z.string(),
  depositAddress: DepositAddress,
  assets: z.array(WalletAsset),
  vaultId: z.string(),
  vaultName: z.string(),
  isDefault: z.boolean(),
  isArchived: z.boolean(),
  networkId: z.string(),
  type: z.literal('WALLET')
})
type Wallet = z.infer<typeof Wallet>

const Address = z.object({
  address: z.string(),
  addressId: z.string(),
  addressSignaturePayload: z.string(),
  signature: z.string(),
  walletId: z.string()
})
type Address = z.infer<typeof Address>

const GetVaultsResponse = z.object({
  data: z.array(Vault),
  page: z.object({
    next: z.string().nullish()
  })
})
type GetVaultsResponse = z.infer<typeof GetVaultsResponse>

const GetWalletsResponse = z.object({
  data: z.array(Wallet),
  page: z.object({
    next: z.string().nullish()
  })
})
type GetWalletsResponse = z.infer<typeof GetWalletsResponse>

const GetVaultAddressesResponse = z.object({
  data: z.array(Address),
  page: z.object({
    next: z.string().nullish()
  })
})
type GetVaultAddressesResponse = z.infer<typeof GetVaultAddressesResponse>

interface RequestOptions {
  url: string
  apiKey: string
  signKey: Ed25519PrivateKey
  limit?: number
}

@Injectable()
export class AnchorageClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService
  ) {}

  async forward({ url, method, body, apiKey, signKey }: BuildAnchorageRequestParams): Promise<AxiosResponse> {
    const request = await buildAnchorageSignedRequest({
      url,
      method,
      body,
      apiKey,
      signKey
    })

    try {
      const response = await axios(request)
      return response
    } catch (error) {
      throw new ProxyRequestException({
        message: 'Anchorage request failed',
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        context: { url, method, body }
      })
    }
  }

  async getVaults(opts: RequestOptions): Promise<Vault[]> {
    this.logger.log('Requesting Anchorage vaults page', {
      url: opts.url,
      limit: opts.limit
    })

    const request = await buildAnchorageSignedRequest({
      url: `${opts.url}/v2/vaults`,
      method: 'GET',
      apiKey: opts.apiKey,
      signKey: opts.signKey
    })

    return lastValueFrom(
      this.getVaultsPage(request).pipe(
        expand((response) =>
          response.page.next
            ? // TODO: Use the signed request
              this.getVaultsPage({
                ...opts,
                url: response.page.next
              })
            : EMPTY
        ),
        tap((response) => {
          if (response.page.next) {
            this.logger.log('Requesting Anchorage vaults next page', {
              url: response.page.next,
              limit: opts.limit
            })
          } else {
            this.logger.log('Reached Anchorage vaults last page')
          }
        }),
        reduce((vaults: Vault[], response) => [...vaults, ...response.data], []),
        tap((vaults) => {
          this.logger.log('Completed fetching all vaults', {
            vaultsCount: vaults.length,
            url: opts.url
          })
        }),
        catchError((error) => {
          this.logger.error('Failed to get Anchorage vaults', { error })

          throw error
        })
      )
    )
  }

  private getVaultsPage(request: AxiosRequestConfig): Observable<GetVaultsResponse> {
    return this.httpService.request(request).pipe(
      tap((response) => {
        this.logger.log('Received Anchorage vaults page', {
          data: response.data
        })
      }),
      map((response) => GetVaultsResponse.parse(response.data))
    )
  }

  async getWallets(opts: RequestOptions): Promise<Wallet[]> {
    const request = await buildAnchorageSignedRequest({
      url: `${opts.url}/v2/wallets`,
      method: 'GET',
      apiKey: opts.apiKey,
      signKey: opts.signKey
    })

    return lastValueFrom(
      this.getWalletsPage(request).pipe(
        expand((response) =>
          response.page.next
            ? // TODO: use signed request
              this.getWalletsPage({
                ...opts,
                url: response.page.next
              })
            : EMPTY
        ),
        tap((response) => {
          if (response.page.next) {
            this.logger.log('Requesting Anchorage wallets next page', {
              url: response.page.next,
              limit: opts.limit
            })
          } else {
            this.logger.log('Reached Anchorage wallets last page')
          }
        }),
        reduce((wallets: Wallet[], response) => [...wallets, ...response.data], []),
        tap((wallets) => {
          this.logger.log('Completed fetching all wallets', {
            walletsCount: wallets.length,
            url: opts.url
          })
        }),
        catchError((error) => {
          this.logger.error('Failed to get Anchorage wallets', { error })

          throw error
        })
      )
    )
  }

  private getWalletsPage(request: AxiosRequestConfig): Observable<GetWalletsResponse> {
    return this.httpService.request(request).pipe(
      tap((response) => {
        this.logger.log('Received Anchorage wallets page', {
          data: response.data
        })
      }),
      map((response) => GetWalletsResponse.parse(response.data))
    )
  }

  async getVaultAddresses(opts: RequestOptions & { vaultId: string; assetType: string }): Promise<Address[]> {
    const request = await buildAnchorageSignedRequest({
      url: `${opts.url}/v2/vaults/${opts.vaultId}/addresses`,
      method: 'GET',
      apiKey: opts.apiKey,
      signKey: opts.signKey
    })

    return lastValueFrom(
      this.getVaultAddressesPage({
        ...request,
        params: {
          assetType: opts.assetType
        }
      }).pipe(
        expand((response) =>
          response.page.next
            ? // TODO: Use the signed request
              this.getVaultAddressesPage({
                ...opts,
                url: response.page.next
              })
            : EMPTY
        ),
        tap((response) => {
          if (response.page.next) {
            this.logger.log('Requesting Anchorage vault addresses next page', {
              url: response.page.next,
              limit: opts.limit
            })
          } else {
            this.logger.log('Reached Anchorage vault addresses last page')
          }
        }),
        reduce((addresses: Address[], response) => [...addresses, ...response.data], []),
        tap((vaults) => {
          this.logger.log('Completed fetching all vault addresses', {
            vaultsCount: vaults.length,
            url: opts.url
          })
        }),
        catchError((error) => {
          this.logger.error('Failed to get Anchorage vault addresses', { error })

          throw error
        })
      )
    )
  }

  private getVaultAddressesPage(request: AxiosRequestConfig): Observable<GetVaultAddressesResponse> {
    return this.httpService.request(request).pipe(
      tap((response) => {
        this.logger.log('Received Anchorage vaults addresses page', {
          data: response.data
        })
      }),
      map((response) => GetVaultAddressesResponse.parse(response.data))
    )
  }
}

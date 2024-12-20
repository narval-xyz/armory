import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey, privateKeyToHex } from '@narval/signature'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { sign } from '@noble/ed25519'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isNil, omitBy } from 'lodash'
import { EMPTY, Observable, catchError, expand, from, lastValueFrom, map, reduce, switchMap, tap } from 'rxjs'
import { ZodType, z } from 'zod'
import { BrokerException } from '../../core/exception/broker.exception'
import { ProxyRequestException } from '../../core/exception/proxy-request.exception'
import { UrlParserException } from '../../core/exception/url-parser.exception'

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

export const TrustedDestination = z.object({
  id: z.string(),
  type: z.literal('crypto'),
  crypto: z.object({
    address: z.string(),
    networkId: z.string(),
    // Asset type is optional. If it is not provided, then the destination will accept any network compatible transfer
    // e.g: ETH network can accept only one specific token on ETH network
    assetType: z.string().optional(),
    memo: z.string().optional()
  })
})
export type TrustedDestination = z.infer<typeof TrustedDestination>

const GetTrustedDestinationsResponse = z.object({
  data: z.array(TrustedDestination),
  page: z.object({
    next: z.string().nullish()
  })
})
type GetTrustedDestinationsResponse = z.infer<typeof GetTrustedDestinationsResponse>

interface RequestOptions {
  url: string
  apiKey: string
  signKey: Ed25519PrivateKey
  limit?: number
}

interface ForwardRequestOptions {
  url: string
  method: string
  data?: unknown
  apiKey: string
  signKey: Ed25519PrivateKey
}

@Injectable()
export class AnchorageClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService
  ) {}

  async forward({ url, method, data, apiKey, signKey }: ForwardRequestOptions): Promise<AxiosResponse> {
    const signedRequest = await this.authorize({
      request: {
        url,
        method,
        data
      },
      apiKey,
      signKey
    })

    try {
      const response = await axios(signedRequest)

      return response
    } catch (error) {
      throw new ProxyRequestException({
        message: 'Anchorage proxy request failed',
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        context: {
          url,
          method
        }
      })
    }
  }

  async authorize(opts: {
    request: AxiosRequestConfig
    apiKey: string
    signKey: Ed25519PrivateKey
    now?: Date
  }): Promise<AxiosRequestConfig> {
    const { request, signKey, apiKey } = opts

    this.validateRequest(request)

    const now = opts.now ? opts.now.getTime() : new Date().getTime()
    const timestamp = Math.floor(now / 1000)
    const message = this.buildSignatureMessage(request, timestamp)
    const messageHex = Buffer.from(message, 'utf8').toString('hex')
    const signKeyHex = await privateKeyToHex(signKey)
    const signature = await sign(messageHex, signKeyHex.slice(2))
    const signatureHex = Buffer.from(signature).toString('hex')
    const headers = {
      'Api-Access-Key': apiKey,
      'Api-Signature': signatureHex,
      'Api-Timestamp': timestamp,
      'Content-Type': 'application/json'
    }

    const data = request.data && request.method !== 'GET' ? request.data : undefined

    return {
      ...request,
      headers,
      data
    }
  }

  parseEndpoint(url: string): string {
    const regex = /(\/v\d+(?:\/.*)?)$/
    const match = url.match(regex)

    if (!match) {
      throw new UrlParserException({
        message: 'No version pattern found in the URL',
        url
      })
    }

    return match[1]
  }

  private validateRequest(request: AxiosRequestConfig): asserts request is AxiosRequestConfig & {
    url: string
    method: string
  } {
    if (!request.url) {
      throw new BrokerException({
        message: 'Cannot sign a request without an URL',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    if (!request.method) {
      throw new BrokerException({
        message: 'Cannot sign a request without a method',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }
  }

  buildSignatureMessage(request: AxiosRequestConfig, timestamp: number): string {
    this.validateRequest(request)

    const endpoint = this.parseEndpoint(request.url)
    const method = request.method.toUpperCase()
    const queryParams = new URLSearchParams(omitBy(request.params, isNil)).toString()
    const path = queryParams ? `${endpoint}?${queryParams}` : endpoint

    return `${timestamp}${method}${path}${request.data && method !== 'GET' ? JSON.stringify(request.data) : ''}`
  }

  private sendSignedRequest<T>(opts: {
    schema: ZodType<T>
    request: AxiosRequestConfig
    signKey: Ed25519PrivateKey
    apiKey: string
  }): Observable<T> {
    return from(
      this.authorize({
        request: opts.request,
        apiKey: opts.apiKey,
        signKey: opts.signKey
      })
    ).pipe(
      switchMap((signedRequest) =>
        this.httpService.request(signedRequest).pipe(
          tap((response) => {
            this.logger.log('Received response', {
              url: opts.request.url,
              method: opts.request.method,
              nextPage: response.data?.page?.next
            })
          }),
          map((response) => opts.schema.parse(response.data))
        )
      )
    )
  }

  async getVaults(opts: RequestOptions): Promise<Vault[]> {
    this.logger.log('Requesting Anchorage vaults page', {
      url: opts.url,
      limit: opts.limit
    })

    const { apiKey, signKey, url } = opts

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetVaultsResponse,
        request: {
          url: `${url}/v2/vaults`,
          method: 'GET',
          params: {
            limit: opts.limit
          }
        },
        apiKey,
        signKey
      }).pipe(
        expand((response) => {
          if (response.page.next) {
            return this.sendSignedRequest({
              schema: GetVaultsResponse,
              request: {
                url: response.page.next
              },
              apiKey,
              signKey
            })
          }

          return EMPTY
        }),
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

  async getWallets(opts: RequestOptions): Promise<Wallet[]> {
    this.logger.log('Requesting Anchorage wallets page', {
      url: opts.url,
      limit: opts.limit
    })
    const { apiKey, signKey, url } = opts

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetWalletsResponse,
        request: {
          url: `${url}/v2/wallets`,
          method: 'GET'
        },
        apiKey,
        signKey
      }).pipe(
        expand((response) => {
          if (response.page.next) {
            return this.sendSignedRequest({
              schema: GetWalletsResponse,
              request: {
                url: response.page.next
              },
              apiKey,
              signKey
            })
          }

          return EMPTY
        }),
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

  async getTrustedDestinations(opts: RequestOptions): Promise<TrustedDestination[]> {
    this.logger.log('Requesting Anchorage known addresses page', {
      url: opts.url,
      limit: opts.limit
    })
    const { apiKey, signKey, url } = opts

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetTrustedDestinationsResponse,
        request: {
          url: `${url}/v2/trusted-destinations`,
          method: 'GET'
        },
        apiKey,
        signKey
      }).pipe(
        expand((response) => {
          if (response.page.next) {
            return this.sendSignedRequest({
              schema: GetTrustedDestinationsResponse,
              request: {
                url: response.page.next
              },
              apiKey,
              signKey
            })
          }

          return EMPTY
        }),
        tap((response) => {
          if (response.page.next) {
            this.logger.log('Requesting Anchorage trusted-destinations next page', {
              url: response.page.next,
              limit: opts.limit
            })
          } else {
            this.logger.log('Reached Anchorage trusted-destinations last page')
          }
        }),
        reduce((trustedDestinations: TrustedDestination[], response) => [...trustedDestinations, ...response.data], []),
        tap((trustedDestinations) => {
          this.logger.log('Completed fetching all trusted-destinations', {
            trustedDestinationsCount: trustedDestinations.length,
            url: opts.url
          })
        }),
        catchError((error) => {
          this.logger.error('Failed to get Anchorage trusted-destinations', { error })
          throw error
        })
      )
    )
  }

  async getVaultAddresses(opts: RequestOptions & { vaultId: string; assetType: string }): Promise<Address[]> {
    this.logger.log('Requesting Anchorage vault addresses page', {
      url: opts.url,
      vaultId: opts.vaultId,
      assetType: opts.assetType
    })
    const { apiKey, signKey, url, vaultId, assetType } = opts

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetVaultAddressesResponse,
        request: {
          url: `${url}/v2/vaults/${vaultId}/addresses`,
          method: 'GET',
          params: {
            assetType
          }
        },
        apiKey,
        signKey
      }).pipe(
        expand((response) => {
          if (response.page.next) {
            return this.sendSignedRequest({
              schema: GetVaultAddressesResponse,
              request: {
                url: response.page.next
              },
              apiKey,
              signKey
            })
          }

          return EMPTY
        }),
        tap((response) => {
          if (response.page.next) {
            this.logger.log('Requesting Anchorage vault addresses next page', {
              url: response.page.next,
              vaultId,
              assetType
            })
          } else {
            this.logger.log('Reached Anchorage vault addresses last page')
          }
        }),
        reduce((addresses: Address[], response) => [...addresses, ...response.data], []),
        tap((addresses) => {
          this.logger.log('Completed fetching all vault addresses', {
            addressesCount: addresses.length,
            vaultId,
            assetType,
            url
          })
        }),
        catchError((error) => {
          this.logger.error('Failed to get Anchorage vault addresses', { error })

          throw error
        })
      )
    )
  }
}

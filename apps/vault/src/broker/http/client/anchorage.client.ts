import { LoggerService } from '@narval/nestjs-shared'
import { Ed25519PrivateKey, privateKeyToHex } from '@narval/signature'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { sign } from '@noble/ed25519'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { isNil, omitBy } from 'lodash'
import {
  EMPTY,
  Observable,
  OperatorFunction,
  catchError,
  expand,
  from,
  lastValueFrom,
  map,
  reduce,
  switchMap,
  tap
} from 'rxjs'
import { ZodType, z } from 'zod'
import { BrokerException } from '../../core/exception/broker.exception'
import { ProviderHttpException } from '../../core/exception/provider-http.exception'
import { UrlParserException } from '../../core/exception/url-parser.exception'
import { Provider } from '../../core/type/connection.type'

//
// Response Schema
//

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

const TransferAmount = z.object({
  assetType: z.string(),
  currentPrice: z.string().optional(),
  currentUSDValue: z.string().optional(),
  quantity: z.string()
})

const TransferFee = z.object({
  assetType: z.string(),
  quantity: z.string()
})

const Resource = z.object({
  id: z.string(),
  type: z.string()
})

const Transfer = z.object({
  amount: TransferAmount,
  assetType: z.string(),
  blockchainTxId: z.string().optional(),
  createdAt: z.string(),
  destination: Resource,
  endedAt: z.string().optional(),
  fee: TransferFee.optional(),
  source: Resource,
  status: z.string(),
  transferId: z.string(),
  transferMemo: z.string().optional()
})
type Transfer = z.infer<typeof Transfer>

const CreateTransfer = z.object({
  amount: z.string(),
  assetType: z.string(),
  deductFeeFromAmountIfSameType: z.boolean(),
  destination: Resource,
  idempotenceId: z.string().max(128).nullable(),
  source: Resource,
  transferMemo: z.string().nullable()
})
type CreateTransfer = z.infer<typeof CreateTransfer>

const CreatedTransfer = z.object({
  transferId: z.string(),
  status: z.string()
})
type CreatedTransfer = z.infer<typeof CreatedTransfer>

const TrustedDestination = z.object({
  id: z.string(),
  type: z.literal('crypto'),
  crypto: z.object({
    address: z.string(),
    networkId: z.string(),
    // Asset type is optional. If it is not provided, then the destination will
    // accept any network compatible transfer
    // e.g: ETH network can accept only one specific token on ETH network
    assetType: z.string().optional(),
    memo: z.string().optional()
  })
})
type TrustedDestination = z.infer<typeof TrustedDestination>

//
// Response Type
//

const CreateTransferResponse = z.object({
  data: CreatedTransfer
})
type CreateTransferResponse = z.infer<typeof CreateTransferResponse>

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

const GetTransferResponse = z.object({
  data: Transfer
})
type GetTransferResponse = z.infer<typeof GetTransferResponse>

const GetTrustedDestinationsResponse = z.object({
  data: z.array(TrustedDestination),
  page: z.object({
    next: z.string().nullish()
  })
})
type GetTrustedDestinationsResponse = z.infer<typeof GetTrustedDestinationsResponse>

//
// Request Type
//

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
        data,
        responseType: 'stream',
        // Don't reject on error status codes. Needed to re-throw our exception
        validateStatus: null
      },
      apiKey,
      signKey
    })

    const response = await axios(signedRequest)

    return response
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
        this.handleError('Failed to get Anchorage vaults')
      )
    )
  }

  async getWallets(opts: RequestOptions): Promise<Wallet[]> {
    const { apiKey, signKey, url, limit } = opts

    this.logger.log('Requesting Anchorage wallets page', { url, limit })

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
              limit
            })
          } else {
            this.logger.log('Reached Anchorage wallets last page')
          }
        }),
        reduce((wallets: Wallet[], response) => [...wallets, ...response.data], []),
        tap((wallets) => {
          this.logger.log('Completed fetching all wallets', {
            url,
            walletsCount: wallets.length
          })
        }),
        this.handleError('Failed to get Anchorage wallets')
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
          url: `${url}/v2/trusted_destinations`,
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
    const { apiKey, signKey, url, vaultId, assetType } = opts

    this.logger.log('Requesting Anchorage vault addresses page', {
      url,
      vaultId,
      assetType
    })

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
        this.handleError('Failed to get Anchorage vault addresses')
      )
    )
  }

  async getTransferById(opts: RequestOptions & { transferId: string }): Promise<Transfer> {
    const { apiKey, signKey, url, transferId } = opts

    this.logger.log('Requesting Anchorage transfer', { url, transferId })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetTransferResponse,
        request: {
          url: `${url}/v2/transfers/${transferId}`,
          method: 'GET'
        },
        apiKey,
        signKey
      }).pipe(
        map((response) => response.data),
        tap((transfer) => {
          this.logger.log('Successfully fetched transfer', {
            transferId,
            url,
            status: transfer.status
          })
        }),
        this.handleError('Failed to get Anchorage transfer')
      )
    )
  }

  async createTransfer(opts: RequestOptions & { data: CreateTransfer }): Promise<CreatedTransfer> {
    const { apiKey, signKey, url, data } = opts

    this.logger.log('Sending create transfer in request to Anchorage', { data })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: CreateTransferResponse,
        request: {
          url: `${url}/v2/transfers`,
          method: 'POST',
          data
        },
        apiKey,
        signKey
      }).pipe(
        map((response) => response.data),
        tap((transfer) => {
          this.logger.log('Successfully created transfer', {
            transferId: transfer.transferId,
            url
          })
        }),
        this.handleError('Failed to create Anchorage transfer')
      )
    )
  }

  private handleError<T>(logMessage: string): OperatorFunction<T, T> {
    return catchError((error: unknown): Observable<T> => {
      this.logger.error(logMessage, { error })

      if (error instanceof AxiosError) {
        throw new ProviderHttpException({
          provider: Provider.ANCHORAGE,
          origin: error,
          response: {
            status: error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            body: error.response?.data
          }
        })
      }

      throw error
    })
  }
}

import { LoggerService } from '@narval/nestjs-shared'
import { RsaPrivateKey, signJwt } from '@narval/signature'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable } from '@nestjs/common'
import { sha256 } from '@noble/hashes/sha256'
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
import { v4 } from 'uuid'
import { toHex } from 'viem'
import { ZodType, z } from 'zod'
import { BrokerException } from '../../core/exception/broker.exception'
import { ProviderHttpException } from '../../core/exception/provider-http.exception'
import { UrlParserException } from '../../core/exception/url-parser.exception'
import { Provider } from '../../core/type/provider.type'

interface ForwardRequestOptions {
  url: string
  method: string
  data?: unknown
  apiKey: string
  signKey: RsaPrivateKey
  nonce: string
}

const RewardsInfo = z.object({
  pendingRewards: z.coerce.number().positive()
})
type RewardsInfo = z.infer<typeof RewardsInfo>

// Fireblocks API is not consistent in the response format for Asset and AssetWallet, but they seem to be the same underlying data
const Asset = z.object({
  // !![This is NOT discretionary.](https://developers.fireblocks.com/docs/list-supported-assets-1)
  id: z.string(),
  total: z.string(),
  available: z.string(),
  pending: z.string(),
  frozen: z.string(),
  lockedAmount: z.string(),
  blockHeight: z.string().optional(),
  blockHash: z.string().optional(),
  rewardsInfo: RewardsInfo.optional(),
  hiddenOnUI: z.boolean().optional(),
  customerRefId: z.string().optional(),
  autoFuel: z.boolean().optional()
})
type Asset = z.infer<typeof Asset>

const VaultAccount = z.object({
  id: z.string(),
  name: z.string().optional(),
  assets: z.array(Asset),
  hiddenOnUI: z.boolean().optional(),
  customerRefId: z.string().optional(),
  autoFuel: z.boolean()
})
type VaultAccount = z.infer<typeof VaultAccount>

const Paging = z.object({
  before: z.string().optional(),
  after: z.string().optional()
})
type Paging = z.infer<typeof Paging>

const GetVaultAccountsResponse = z.object({
  accounts: z.array(VaultAccount),
  paging: Paging
})
type GetVaultAccountsResponse = z.infer<typeof GetVaultAccountsResponse>

// Fireblocks API is not consistent in the response format for Asset and AssetWallet, but they seem to be the same underlying data
const AssetWallet = z.object({
  // id of the vaultAccount
  vaultId: z.string(),
  // !![This is NOT discretionary.](https://developers.fireblocks.com/docs/list-supported-assets-1)
  assetId: z.string(),
  available: z.string(),
  //The total wallet balance.
  // Total = available + pending + lockedAmount + frozen
  // In EOS this value includes the network balance, self staking and pending refund.
  // For all other coins it is the balance as it appears on the blockchain.
  total: z.string(),
  pending: z.string(),
  staked: z.string(),
  frozen: z.string(),
  lockedAmount: z.string(),
  blockHeight: z.string().nullable(),
  blockHash: z.string().nullable(),
  creationTimestamp: z.string().optional()
})
type AssetWallet = z.infer<typeof AssetWallet>

const GetVaultWalletsResponse = z.object({
  assetWallets: z.array(AssetWallet),
  paging: Paging
})
type GetVaultWalletsResponse = z.infer<typeof GetVaultWalletsResponse>

const AssetAddress = z.object({
  assetId: z.string(),
  address: z.string(),
  description: z.string().optional(),
  tag: z.string().optional(),
  type: z.string(),
  customerRefId: z.string().optional(),
  addressFormat: z.string().optional(),
  legacyAddress: z.string(),
  enterpriseAddress: z.string(),
  bip44AddressIndex: z.number(),
  userDefined: z.boolean()
})
type AssetAddress = z.infer<typeof AssetAddress>

const GetAddressListResponse = z.object({
  addresses: z.array(AssetAddress),
  paging: Paging.optional()
})
type GetAddressListResponse = z.infer<typeof GetAddressListResponse>

const WhitelistedAddressAsset = z.object({
  id: z.string(),
  balance: z.string().optional(),
  lockedAmount: z.string().optional(),
  status: z.string(),
  address: z.string(),
  tag: z.string().optional(),
  activationTime: z.string().optional()
})
type WhitelistedAddressAsset = z.infer<typeof WhitelistedAddressAsset>

const WhitelistedWallet = z.object({
  id: z.string(),
  name: z.string(),
  customerRefId: z.string().optional(),
  assets: z.array(WhitelistedAddressAsset)
})
export type WhitelistedWallet = z.infer<typeof WhitelistedWallet>

const GetWhitelistedWalletsResponse = z.array(WhitelistedWallet)
type GetWhitelistedWalletsResponse = z.infer<typeof GetWhitelistedWalletsResponse>

const TransactionAmountInfo = z.object({
  amount: z.string(),
  requestedAmount: z.string(),
  netAmount: z.string().optional(),
  amountUSD: z.string()
})

const TransactionFeeInfo = z.object({
  networkFee: z.string().optional(),
  gasPrice: z.string().optional()
})
export type TransactionFeeInfo = z.infer<typeof TransactionFeeInfo>

const TransactionBlockInfo = z.object({
  blockHeight: z.string().optional(),
  blockHash: z.string().nullable()
})

const TransactionParty = z.object({
  id: z.string().nullable(),
  type: z.string(),
  name: z.string().optional(),
  subType: z.string()
})

const Transaction = z.object({
  addressType: z.string(),
  amount: z.number(),
  amountInfo: TransactionAmountInfo,
  amountUSD: z.number(),
  assetId: z.string(),
  assetType: z.string(),
  blockInfo: TransactionBlockInfo.optional(),
  createdAt: z.number(),
  createdBy: z.string(),
  destination: TransactionParty,
  destinationAddress: z.string(),
  destinationAddressDescription: z.string(),
  destinationTag: z.string(),
  destinations: z.array(z.unknown()),
  exchangeTxId: z.string(),
  fee: z.number(),
  feeCurrency: z.string(),
  feeInfo: TransactionFeeInfo,
  id: z.string(),
  index: z.number().optional(),
  lastUpdated: z.number(),
  netAmount: z.number(),
  networkFee: z.number(),
  note: z.string(),
  numOfConfirmations: z.number().optional(),
  operation: z.string(),
  rejectedBy: z.string(),
  requestedAmount: z.number(),
  signedBy: z.array(z.string()),
  signedMessages: z.array(z.unknown()),
  source: TransactionParty,
  sourceAddress: z.string(),
  status: z.string(),
  subStatus: z.string(),
  txHash: z.string()
})
export type Transaction = z.infer<typeof Transaction>

const CreateTransactionResponse = z.object({
  id: z.string(),
  status: z.string()
})
type CreateTransactionResponse = z.infer<typeof CreateTransactionResponse>

interface RequestParams {
  apiKey: string
  signKey: RsaPrivateKey
  url: string
}

// IMPORTANT: These aren't all FB create transaction parameters.
// See https://developers.fireblocks.com/reference/createtransaction
export interface CreateTransaction {
  amount: string
  operation?: string
  note?: string
  externalTxId?: string
  assetId: string
  source: {
    type: string
    id?: string
  }
  destination: {
    type: string
    id?: string
    oneTimeAddress?: {
      address: string
    }
  }
  treatAsGrossAmount?: boolean
  feeLevel?: string
  priorityFee?: string
  failOnLowFee?: boolean
  maxFee?: string
  gasLimit?: string
  gasPrice?: string
  networkFee?: string
  replaceTxByHash?: string
  customerRefId?: string
  useGasless?: boolean
  // Headers
  idempotencyKey?: string
  requestId?: string
}
@Injectable()
export class FireblocksClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService
  ) {}

  async forward({ url, method, data, apiKey, signKey, nonce }: ForwardRequestOptions): Promise<AxiosResponse> {
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
      signKey,
      nonce
    })

    const response = await axios(signedRequest)

    return response
  }

  async authorize(opts: {
    request: AxiosRequestConfig
    apiKey: string
    signKey: RsaPrivateKey
    nonce?: string
    now?: Date
  }): Promise<AxiosRequestConfig> {
    const { request, signKey, apiKey } = opts

    this.validateRequest(request)

    const endpoint = this.parseEndpoint(request.url)

    // Subtract 10 seconds to avoid clock skew
    const now = Math.floor((opts.now ? opts.now.getTime() : Date.now()) / 1000) - 10

    const queryParams = new URLSearchParams(omitBy(request.params, isNil)).toString()
    const uri = queryParams ? `${endpoint}?${queryParams}` : endpoint

    const exp = now + 30

    const bodyHash = this.getBodyHash(request)

    const payload = {
      uri,
      nonce: opts.nonce || v4(),
      iat: now,
      sub: apiKey,
      exp,
      bodyHash
    }

    const token = await signJwt(payload, signKey)

    const headers = {
      ...(request.headers ? request.headers : {}),
      'x-api-key': apiKey,
      authorization: `Bearer ${token}`
    }

    const data = request.data && request.method !== 'GET' ? request.data : undefined

    return {
      ...request,
      headers,
      data
    }
  }

  /**
   * Returns a hex-encoded SHA-256 hash of the raw HTTP request body.
   *
   * @see https://developers.fireblocks.com/reference/signing-a-request-jwt-structure#jwt-structure
   */
  getBodyHash(request: AxiosRequestConfig): string {
    if (request.data) {
      return toHex(sha256(JSON.stringify(request.data))).slice(2)
    }

    return ''
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

  private handleError<T>(logMessage: string): OperatorFunction<T, T> {
    return catchError((error: unknown): Observable<T> => {
      this.logger.error(logMessage, { error })

      if (error instanceof AxiosError) {
        throw new ProviderHttpException({
          provider: Provider.FIREBLOCKS,
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

  private sendSignedRequest<T>(opts: {
    schema: ZodType<T>
    request: AxiosRequestConfig
    signKey: RsaPrivateKey
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
            this.logger.log('Received Fireblocks response', {
              url: opts.request.url,
              method: opts.request.method,
              nextPage: response.data?.paging?.after,
              body: response.data || null
            })
          }),
          map((response) => opts.schema.parse(response.data))
        )
      )
    )
  }

  async getVaultAccounts(opts: { apiKey: string; signKey: RsaPrivateKey; url: string }): Promise<VaultAccount[]> {
    this.logger.log('Requesting Fireblocks vault accounts page', {
      url: opts.url
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetVaultAccountsResponse,
        request: {
          url: `${opts.url}/v1/vault/accounts_paged`,
          params: {
            limit: 500
          },
          method: 'GET'
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        expand((response) => {
          if (response.paging.after) {
            return this.sendSignedRequest({
              schema: GetVaultAccountsResponse,
              request: {
                url: `${opts.url}/v1/vault/accounts_paged`,
                method: 'GET',
                params: {
                  limit: 500,
                  after: response.paging.after
                }
              },
              apiKey: opts.apiKey,
              signKey: opts.signKey
            })
          }
          return EMPTY
        }),
        tap((response) => {
          if (response.paging.after) {
            this.logger.log('Requesting Fireblocks vault accounts next page', {
              url: opts.url
            })
          } else {
            this.logger.log('Reached Fireblocks vault accounts last page')
          }
        }),
        reduce((accounts: VaultAccount[], response) => [...accounts, ...response.accounts], []),
        tap((accounts) => {
          this.logger.log('Completed fetching all vault accounts', {
            accountsCount: accounts.length,
            url: opts.url
          })
        }),
        this.handleError('Failed to get Fireblocks vault accounts')
      )
    )
  }

  async getAssetWallets(opts: { apiKey: string; signKey: RsaPrivateKey; url: string }): Promise<AssetWallet[]> {
    this.logger.log('Requesting Fireblocks asset wallets page', {
      url: opts.url
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetVaultWalletsResponse,
        request: {
          url: `${opts.url}/v1/vault/asset_wallets`,
          method: 'GET',
          params: {
            limit: 1000
          }
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        expand((response) => {
          if (response.paging.after) {
            return this.sendSignedRequest({
              schema: GetVaultWalletsResponse,
              request: {
                url: `${opts.url}/v1/vault/asset_wallets`,
                method: 'GET',
                params: {
                  after: response.paging.after,
                  limit: 1000
                }
              },
              apiKey: opts.apiKey,
              signKey: opts.signKey
            })
          }
          return EMPTY
        }),
        tap((response) => {
          if (response.paging.after) {
            this.logger.log('Requesting Fireblocks asset wallets next page', {
              url: opts.url
            })
          } else {
            this.logger.log('Reached Fireblocks asset wallets last page')
          }
        }),
        reduce((wallets: AssetWallet[], response) => [...wallets, ...response.assetWallets], []),
        tap((wallets) => {
          this.logger.log('Completed fetching all asset wallets', {
            walletsCount: wallets.length,
            url: opts.url
          })
        }),
        this.handleError('Failed to get Fireblocks asset wallets')
      )
    )
  }

  async getAddresses(opts: {
    apiKey: string
    signKey: RsaPrivateKey
    url: string
    vaultAccountId: string
    assetId: string
  }): Promise<AssetAddress[]> {
    this.logger.log(`Requesting Fireblocks vault ${opts.vaultAccountId} asset ${opts.assetId} addresses page`, {
      url: opts.url,
      vaultAccountId: opts.vaultAccountId,
      assetId: opts.assetId
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetAddressListResponse,
        request: {
          url: `${opts.url}/v1/vault/accounts/${opts.vaultAccountId}/${opts.assetId}/addresses_paginated`,
          method: 'GET',
          params: {
            limit: 1000
          }
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        expand((response) => {
          if (response.paging?.after) {
            return this.sendSignedRequest({
              schema: GetAddressListResponse,
              request: {
                url: `${opts.url}/v1/vault/accounts/${opts.vaultAccountId}/${opts.assetId}/addresses_paginated`,
                method: 'GET',
                params: {
                  after: response.paging.after,
                  limit: 1000
                }
              },
              apiKey: opts.apiKey,
              signKey: opts.signKey
            })
          }
          return EMPTY
        }),
        tap((response) => {
          if (response.paging?.after) {
            this.logger.log(
              `Requesting Fireblocks vault ${opts.vaultAccountId} asset ${opts.assetId} addresses next page`,
              {
                url: opts.url,
                vaultAccountId: opts.vaultAccountId,
                assetId: opts.assetId
              }
            )
          } else {
            this.logger.log(`Reached Fireblocks vault ${opts.vaultAccountId} asset ${opts.assetId} addresses last page`)
          }
        }),
        reduce((addresses: AssetAddress[], response) => [...addresses, ...response.addresses], []),
        tap((addresses) => {
          this.logger.log(`Completed fetching all ${opts.assetId} addresses`, {
            addressesCount: addresses.length,
            url: opts.url,
            vaultAccountId: opts.vaultAccountId,
            assetId: opts.assetId
          })
        }),
        this.handleError(`Failed to get Fireblocks vault ${opts.vaultAccountId} asset ${opts.assetId} addresses`)
      )
    )
  }

  async getWhitelistedInternalWallets(opts: {
    apiKey: string
    signKey: RsaPrivateKey
    url: string
  }): Promise<WhitelistedWallet[]> {
    this.logger.log('Requesting Fireblocks whitelisted internal wallets page', {
      url: opts.url
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetWhitelistedWalletsResponse,
        request: {
          url: `${opts.url}/v1/internal_wallets`,
          method: 'GET'
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        reduce((wallets: WhitelistedWallet[], response) => [...wallets, ...response], []),
        tap((addresses) => {
          this.logger.log('Completed fetching all whitelisted internal addresses', {
            addressesCount: addresses.length,
            url: opts.url
          })
        }),
        this.handleError('Failed to get Fireblocks whitelisted internal addresses')
      )
    )
  }

  async getWhitelistedExternalWallets(opts: {
    apiKey: string
    signKey: RsaPrivateKey
    url: string
  }): Promise<WhitelistedWallet[]> {
    this.logger.log('Requesting Fireblocks whitelisted external wallets page', {
      url: opts.url
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetWhitelistedWalletsResponse,
        request: {
          url: `${opts.url}/v1/external_wallets`,
          method: 'GET'
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        reduce((wallets: WhitelistedWallet[], response) => [...wallets, ...response], []),
        tap((addresses) => {
          this.logger.log('Completed fetching all whitelisted external addresses', {
            addressesCount: addresses.length,
            url: opts.url
          })
        }),
        this.handleError('Failed to get Fireblocks whitelisted external addresses')
      )
    )
  }

  async getWhitelistedContracts(opts: {
    apiKey: string
    signKey: RsaPrivateKey
    url: string
  }): Promise<WhitelistedWallet[]> {
    this.logger.log('Requesting Fireblocks whitelisted contracts page', {
      url: opts.url
    })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: GetWhitelistedWalletsResponse,
        request: {
          url: `${opts.url}/v1/contracts`,
          method: 'GET'
        },
        apiKey: opts.apiKey,
        signKey: opts.signKey
      }).pipe(
        reduce((contracts: WhitelistedWallet[], response) => [...contracts, ...response], []),
        tap((contracts) => {
          this.logger.log('Completed fetching all whitelisted contracts', {
            contractsCount: contracts.length,
            url: opts.url
          })
        }),
        this.handleError('Failed to get Fireblocks whitelisted contracts')
      )
    )
  }

  async createTransaction(params: RequestParams & { data: CreateTransaction }): Promise<CreateTransactionResponse> {
    const { apiKey, signKey, url } = params
    const { idempotencyKey, ...data } = params.data

    this.logger.log('Sending create transaction request to Fireblocks', { url, data: params.data })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: CreateTransactionResponse,
        request: {
          url: `${url}/v1/transactions`,
          method: 'POST',
          data,
          ...(idempotencyKey
            ? {
                headers: {
                  'idempotency-key': idempotencyKey
                }
              }
            : {})
        },
        apiKey,
        signKey
      }).pipe(
        tap((tx) => {
          this.logger.log('Successfully created Fireblocks transaction', {
            transactionId: tx.id,
            url
          })
        }),
        this.handleError('Failed to create Fireblocks transaction')
      )
    )
  }

  async getTransactionById(params: RequestParams & { txId: string }): Promise<Transaction> {
    const { apiKey, signKey, url, txId } = params

    this.logger.log('Request Fireblocks transaction by ID', { url, txId })

    return lastValueFrom(
      this.sendSignedRequest({
        schema: Transaction,
        request: {
          url: `${url}/v1/transactions/${txId}`,
          method: 'GET'
        },
        apiKey,
        signKey
      }).pipe(
        tap((tx) => {
          this.logger.log('Successfully got Fireblocks transaction', {
            transactionId: tx.id,
            url
          })
        }),
        this.handleError('Failed to get Fireblocks transaction by ID')
      )
    )
  }
}

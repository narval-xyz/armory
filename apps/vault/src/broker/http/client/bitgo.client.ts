import { LoggerService } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { AxiosError } from 'axios'
import { BitGo, TokenType, TxRequest } from 'bitgo'
import { randomUUID } from 'crypto'
import { Observable, OperatorFunction, catchError, from, lastValueFrom, map, switchMap, tap } from 'rxjs'
import { z } from 'zod'
import { ProviderHttpException } from '../../core/exception/provider-http.exception'
import { Provider } from '../../core/type/provider.type'
import { NetworkFeeAttribution } from '../../core/type/transfer.type'

//
// Response Schema
//

const BitGoCoinSpecific = z.object({
  deployedInBlock: z.boolean(),
  lastChainIndex: z.unknown(),
  baseAddress: z.string(),
  feeAddress: z.string(),
  pendingChainInitialization: z.boolean(),
  pendingEcdsaTssInitialization: z.boolean(),
  creationFailure: z.array(z.unknown()),
  gasPriceTier: z.string(),
  tokenFlushThresholds: z.record(z.unknown()),
  lowPriorityFeeAddress: z.string(),
  salt: z.string(),
  walletVersion: z.number(),
  pendingDeployment: z.boolean(),
  deployForwardersManually: z.boolean(),
  flushForwardersManually: z.boolean(),
  enableMMI: z.boolean(),
  enableNFT: z.boolean()
})

const BitGoReceiveAddress = z.object({
  id: z.string(),
  address: z.string(),
  chain: z.number(),
  index: z.number(),
  coin: z.string(),
  lastNonce: z.number().optional(),
  wallet: z.string(),
  lastConsolidatedTime: z.string().optional(),
  needsConsolidation: z.boolean().optional(),
  coinSpecific: z.unknown()
})

export const BitGoWallet = z.object({
  id: z.string(),
  coin: z.string(),
  label: z.string(),
  enterprise: z.string(),
  organization: z.string(),
  bitgoOrg: z.string(),
  freeze: z.record(z.unknown()),
  deleted: z.boolean(),
  approvalsRequired: z.number(),
  isCold: z.boolean(),
  coinSpecific: BitGoCoinSpecific,
  startDate: z.string(),
  type: z.string(),
  hasLargeNumberOfAddresses: z.boolean(),
  receiveAddress: BitGoReceiveAddress,
  balanceString: z.string().optional(),
  confirmedBalanceString: z.string().optional(),
  spendableBalanceString: z.string().optional(),
  tokens: z
    .record(
      z.object({
        balanceString: z.string(),
        confirmedBalanceString: z.string(),
        spendableBalanceString: z.string(),
        lockedBalanceString: z.string(),
        transferCount: z.number()
      })
    )
    .optional()
})
export type BitGoWallet = z.infer<typeof BitGoWallet>

const GetWalletsResponse = z.object({
  wallets: z.array(BitGoWallet)
})
type GetWalletsResponse = z.infer<typeof GetWalletsResponse>

export const MinimalTransactionObject = z.object({
  state: z.string(),
  txRequestId: z.string()
})
export type MinimalTransactionObject = z.infer<typeof MinimalTransactionObject>

export const GetTransactions = z.object({
  txRequests: z.array(MinimalTransactionObject)
})
export type GetTransactions = z.infer<typeof GetTransactions>

//
// Request Options Types
//
interface RequestOptions {
  url: string
  apiKey: string
  walletPassphrase?: string
}

interface GetWalletsOptions extends RequestOptions {
  options: {
    labelContains?: string
    limit?: number
    after?: string
    coin?: string
    walletIds?: string[]
  }
}

interface CreateTransferOptions extends RequestOptions {
  data: {
    walletId: string
    coin: string
    amount: string
    address: string
    asset?: string
    tokenContractAddress?: string
    type: BitGoTransferType
    networkFeeAttribution: NetworkFeeAttribution
    idempotenceId: string
    decimals: number
  }
}

interface GetTransactionOptions extends RequestOptions {
  data: {
    txRequestIds: string[]
    walletId: string
  }
}

export const BitGoTransferType = {
  NATIVE: 'transfer',
  TOKEN: 'transfertoken'
} as const
export type BitGoTransferType = (typeof BitGoTransferType)[keyof typeof BitGoTransferType]

@Injectable()
export class BitgoClient {
  constructor(private readonly logger: LoggerService) {}

  private getBitGoInstance(url: string, apiKey: string): BitGo {
    return new BitGo({
      env: url.includes('test') ? 'test' : 'prod',
      accessToken: apiKey
    })
  }

  private handleError<T>(logMessage: string): OperatorFunction<T, T> {
    return catchError((error: unknown): Observable<T> => {
      this.logger.error(logMessage, { error })

      if (error instanceof AxiosError) {
        throw new ProviderHttpException({
          provider: Provider.BITGO,
          origin: error,
          response: {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: error.message
          }
        })
      }

      throw error
    })
  }
  async createTransfer(opts: CreateTransferOptions): Promise<TxRequest> {
    const bitgo = this.getBitGoInstance(opts.url, opts.apiKey)

    this.logger.log('Creating BitGo transfer', {
      walletId: opts.data.walletId,
      coin: opts.data.coin,
      type: opts.data.type,
      asset: opts.data.asset
    })

    const txRequestId = randomUUID()
    return lastValueFrom(
      from(bitgo.coin(opts.data.coin.toLowerCase()).wallets().get({ id: opts.data.walletId })).pipe(
        switchMap((wallet) => {
          const txData =
            opts.data.type === BitGoTransferType.NATIVE
              ? {
                  txRequestId,
                  recipients: [
                    {
                      amount: opts.data.amount,
                      address: opts.data.address
                    }
                  ],
                  walletPassphrase: opts.walletPassphrase,
                  type: opts.data.type
                }
              : {
                  txRequestId,
                  recipients: [
                    {
                      tokenData: {
                        tokenType: TokenType.ERC20,
                        tokenQuantity: opts.data.amount,
                        tokenContractAddress: opts.data.tokenContractAddress,
                        tokenName: opts.data.asset?.toLowerCase(),
                        decimalPlaces: opts.data.decimals
                      },
                      amount: '0',
                      address: opts.data.address
                    }
                  ],
                  walletPassphrase: opts.walletPassphrase,
                  type: opts.data.type
                }

          return from(wallet.prebuildAndSignTransaction(txData) as Promise<TxRequest>)
        }),
        tap((tx: TxRequest) => {
          this.logger.log('Successfully created BitGo transfer', {
            walletId: opts.data.walletId,
            txRequestId: tx.txRequestId
          })
        }),
        this.handleError('Failed to create BitGo transfer')
      )
    )
  }

  async getWallets(opts: GetWalletsOptions): Promise<BitGoWallet[]> {
    const bitgo = this.getBitGoInstance(opts.url, opts.apiKey)

    this.logger.log('Requesting BitGo wallets', {
      url: opts.url,
      options: opts.options
    })

    const queryParams = new URLSearchParams()
    if (opts.options.walletIds) {
      opts.options.walletIds.forEach((id) => {
        queryParams.append('id[]', id)
      })
    }
    if (opts.options.labelContains) queryParams.append('labelContains', opts.options.labelContains)
    if (opts.options.limit) queryParams.append('limit', opts.options.limit.toString())
    if (opts.options.after) queryParams.append('prevId', opts.options.after)
    if (opts.options.coin) queryParams.append('coin', opts.options.coin.toLowerCase())
    queryParams.append('expandBalance', 'true')

    const url = `${opts.url.replace(/\/+$/, '')}/api/v2/wallets${queryParams.toString() ? '?' + queryParams.toString() : ''}`

    return lastValueFrom(
      from(bitgo.get(url)).pipe(
        map((response) => GetWalletsResponse.parse(response.body)),
        map((response) => response.wallets),
        tap((wallets) => {
          this.logger.log('Successfully fetched BitGo wallets', {
            url,
            walletsCount: wallets.length
          })
        }),
        this.handleError('Failed to get BitGo wallets')
      )
    )
  }

  async getTransaction(opts: GetTransactionOptions): Promise<MinimalTransactionObject[]> {
    const bitgo = this.getBitGoInstance(opts.url, opts.apiKey)

    this.logger.log('Requesting BitGo transaction', {
      txRequestIds: opts.data.txRequestIds,
      walletId: opts.data.walletId
    })

    const queryParams = new URLSearchParams()

    if (opts.data.txRequestIds) {
      opts.data.txRequestIds.forEach((id) => {
        queryParams.append('txRequestIds[]', id)
      })
    }

    const url = `${opts.url.replace(/\/+$/, '')}/api/v2/wallet/${opts.data.walletId}/txrequests${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return lastValueFrom(
      from(bitgo.get(url)).pipe(
        map((response) => GetTransactions.parse(response.body).txRequests),
        tap((tx) => {
          this.logger.log('Successfully fetched BitGo transaction', {
            url,
            txCount: tx.length
          })
        }),
        this.handleError('Failed to get BitGo transaction')
      )
    )
  }
}

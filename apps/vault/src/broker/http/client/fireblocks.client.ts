import { RsaPrivateKey, hash, signJwt } from '@narval/signature'
import { HttpStatus, Injectable } from '@nestjs/common'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isNil, omitBy } from 'lodash'
import { v4 } from 'uuid'
import { z } from 'zod'
import { BrokerException } from '../../core/exception/broker.exception'
import { UrlParserException } from '../../core/exception/url-parser.exception'

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
  hiddenOnUI: z.boolean(),
  customerRefId: z.string().optional(),
  autoFuel: z.boolean().optional()
})
type Asset = z.infer<typeof Asset>

const VaultAccount = z.object({
  id: z.string(),
  name: z.string().optional(),
  assets: z.array(Asset),
  hiddenOnUI: z.boolean(),
  customerRefId: z.string(),
  autoFuel: z.boolean()
})
type VaultAccount = z.infer<typeof VaultAccount>

const Paging = z.object({
  before: z.string(),
  after: z.string()
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
  creationTimestamp: z.string()
})
type AssetWallet = z.infer<typeof AssetWallet>

const GetVaultWalletsResponse = z.object({
  assetWallets: z.array(AssetWallet),
  paging: Paging
})
type GetVaultWalletsResponse = z.infer<typeof GetVaultWalletsResponse>

@Injectable()
export class FireblocksClient {
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

    const bodyHash = request.data ? hash(request.data) : ''

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
      'X-API-Key': apiKey,
      Authorization: `Bearer ${token}`
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
}

import {
  REQUEST_HEADER_CLIENT_ID,
  REQUEST_HEADER_CLIENT_SECRET,
  adminApiKeySecurity,
  clientIdSecurity,
  clientSecretSecurity
} from '@narval/nestjs-shared'
import { AssetId } from '@narval/policy-engine-shared'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { BackoffOptions } from 'bull'
import { ZodValidationPipe } from 'nestjs-zod'
import { Chain } from './shared/core/lib/chains.lib'
import { FiatId } from './shared/core/type/price.type'
import { ApplicationExceptionFilter } from './shared/filter/application-exception.filter'
import { ZodExceptionFilter } from './shared/filter/zod-exception.filter'

//
// Providers
//

export const HTTP_VALIDATION_PIPES = [
  {
    provide: APP_PIPE,
    // Enable transformation after validation for HTTP response serialization.
    useFactory: () => new ValidationPipe({ transform: true })
  },
  {
    provide: APP_PIPE,
    useClass: ZodValidationPipe
  }
]

export const HTTP_EXCEPTION_FILTERS = [
  {
    provide: APP_FILTER,
    useClass: ApplicationExceptionFilter
  },
  {
    provide: APP_FILTER,
    useClass: ZodExceptionFilter
  }
]

export const DEFAULT_HTTP_MODULE_PROVIDERS = [
  {
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
  },
  ...HTTP_EXCEPTION_FILTERS,
  ...HTTP_VALIDATION_PIPES
]

//
// Headers
//

export const REQUEST_HEADER_API_KEY = 'x-api-key'

//
// API Security
//

export const ADMIN_SECURITY = adminApiKeySecurity(REQUEST_HEADER_API_KEY)
export const CLIENT_ID_SECURITY = clientIdSecurity(REQUEST_HEADER_CLIENT_ID)
export const CLIENT_SECRET_SECURITY = clientSecretSecurity(REQUEST_HEADER_CLIENT_SECRET)

//
// Queues
//

export const QUEUE_PREFIX = 'armory'

export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE = 'authorization-request:processing'
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS = 3
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF: BackoffOptions = {
  type: 'exponential',
  delay: 1_000
}

//
// Asset ID
//

export const ASSET_ID_MAINNET_USDC: AssetId = 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const ASSET_ID_POLYGON_USDC: AssetId = 'eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174'

export const FIAT_ID_USD: FiatId = 'fiat:usd'

//
// Supported chains
//

export const ETHEREUM: Chain = {
  id: 1,
  isTestnet: false,
  name: 'Ethereum Mainnet',
  chain: 'ETH',
  coin: {
    id: 'eip155:1/slip44:60',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  coinGecko: {
    coinId: 'ethereum',
    platform: 'ethereum'
  }
}

export const POLYGON: Chain = {
  id: 137,
  isTestnet: false,
  name: 'Polygon Mainnet',
  chain: 'Polygon',
  coin: {
    id: 'eip155:137/slip44:966',
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18
  },
  coinGecko: {
    coinId: 'matic-network',
    platform: 'polygon-pos'
  }
}

/**
 * @see https://chainid.network/chains.json
 */
export const CHAINS = new Map<number, Chain>([
  [1, ETHEREUM],
  [137, POLYGON]
])

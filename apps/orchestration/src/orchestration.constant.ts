import { FiatId } from '@app/orchestration/shared/core/type/price.type'
import { AssetId } from '@narval/authz-shared'
import { BackoffOptions } from 'bull'

export const QUEUE_PREFIX = 'orchestration'

export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE = 'authorization-request:processing'
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS = 3
export const AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF: BackoffOptions = {
  type: 'exponential',
  delay: 1_000
}

export const REQUEST_HEADER_ORG_ID = 'x-org-id'

export const ASSET_ID_MAINNET_USDC: AssetId = 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const ASSET_ID_POLYGON_USDC: AssetId = 'eip155:1/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174'

export const FIAT_ID_USD: FiatId = 'fiat:usd'

export const SUPPORTED_CHAIN_IDS = [1, 137]

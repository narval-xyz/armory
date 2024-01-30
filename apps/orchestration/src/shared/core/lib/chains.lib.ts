import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { AssetId } from '@narval/authz-shared'
import { HttpStatus } from '@nestjs/common'

export enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137
}

/**
 * @see https://chainid.network/chains.json
 */
export type Chain = {
  id: number
  isTestnet: boolean
  name: string
  chain: string
  coin: {
    id: AssetId
    name: string
    symbol: string
    decimals: number
  }
  // This information is used in the Price module but is maintained here to ensure
  // a single source of truth.
  coinGecko: {
    coinId: string
    platform: string
  }
}

export const ETHEREUM: Chain = {
  id: ChainId.ETHEREUM,
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
  id: ChainId.POLYGON,
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

export const CHAINS = new Map<number, Chain>([
  [ChainId.ETHEREUM, ETHEREUM],
  [ChainId.POLYGON, POLYGON]
])

export const safeGetChain = (chainId: number): Chain | undefined => {
  return CHAINS.get(chainId)
}

export const getChain = (chainId: number): Chain => {
  const chain = safeGetChain(chainId)

  if (chain) {
    return chain
  }

  throw new ApplicationException({
    message: 'Chain ID is unsupported',
    suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    context: { chainId }
  })
}

export const findChain = (pred: (value: Chain) => boolean): Chain | undefined => {
  return Array.from(CHAINS.values()).find(pred)
}

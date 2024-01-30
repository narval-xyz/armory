import { AssetId } from '@narval/authz-shared'

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

export const CHAINS: Record<number, Chain> = {
  [ChainId.ETHEREUM]: ETHEREUM,
  [ChainId.POLYGON]: POLYGON
}

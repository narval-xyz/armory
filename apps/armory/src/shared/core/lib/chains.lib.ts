import { AssetId } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { CHAINS } from '../../../armory.constant'
import { ApplicationException } from '../../../shared/exception/application.exception'

// TODO (@wcalderipe, 09/02/24): After the commit bddb7b3 [1], this constant
// stop working and the application doesn't boot anymore.
//
// [1] https://github.com/narval-xyz/armory/commit/bddb7b303c0549d2a0015da485e9ac37f72dfefc
export const ChainId = {
  ETHEREUM: 1,
  POLYGON: 137
} as const

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

export const safeGetChain = (chainId: number): Chain | undefined => {
  return CHAINS.get(chainId)
}

export const getChain = (chainId: number): Chain => {
  const chain = safeGetChain(chainId)

  if (chain) {
    return chain
  }

  throw new ApplicationException({
    message: 'Chain ID unsupported',
    suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    context: { chainId }
  })
}

export const findChain = (pred: (value: Chain) => boolean): Chain | undefined => {
  return Array.from(CHAINS.values()).find(pred)
}

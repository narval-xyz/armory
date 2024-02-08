import { AssetId } from '@narval/authz-shared'
import { HttpStatus } from '@nestjs/common'
import { CHAINS } from '../../../orchestration.constant'
import { ApplicationException } from '../../../shared/exception/application.exception'

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

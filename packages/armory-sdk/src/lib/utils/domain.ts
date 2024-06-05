import { Chain } from 'viem'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from '../exceptions'
import { mainnet, optimism, polygon } from 'viem/chains'
import { Address, Decision, EvaluationResponse, isAddress } from '@narval/policy-engine-shared'
import { EngineClientConfig } from '../domain'
import { SendEvaluationResponse } from '../types'

export const getChainOrThrow = (chainId: number): Chain => {
  switch (chainId) {
    case 1:
      return mainnet
    case 137:
      return polygon
    case 10:
      return optimism
    default:
      throw new NarvalSdkException('Unsupported chain', {
        chainId
      })
  }
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress}`
  }
  return walletIdOrAddress
}

export const checkDecision = (data: EvaluationResponse, config: EngineClientConfig): SendEvaluationResponse => {
  switch (data.decision) {
    case Decision.PERMIT:
      if (!data.accessToken || !data.accessToken.value) {
        throw new NarvalSdkException('Access token or validated request is missing', {
          evaluation: data,
          authHost: config.authHost,
          authClientId: config.authClientId
        })
      }
      return SendEvaluationResponse.parse(data)
    case Decision.FORBID:
      throw new ForbiddenException('Host denied access', {
        evaluation: data,
        authHost: config.authHost,
        authClientId: config.authClientId
      })
    default: {
      throw new NotImplementedException('Decision not implemented', {
        evaluation: data,
        authHost: config.authHost,
        authClientId: config.authClientId
      })
    }
  }
}

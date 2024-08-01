import { Decision, EvaluationResponse, JwtString, Request, isAddress } from '@narval/policy-engine-shared'
import { JwsdHeader, Payload, hash, hexToBase64Url } from '@narval/signature'
import { v4 } from 'uuid'
import { Address, Chain, Hex } from 'viem'
import { mainnet, optimism, polygon } from 'viem/chains'
import { DETACHED_JWS, HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from './constants'
import { ArmoryClientConfig, JwsdHeaderArgs } from './domain'
import { ArmorySdkException, ForbiddenException, NotImplementedException } from './exceptions'
import { BasicHeaders, GnapHeaders } from './schema'
import { SendEvaluationResponse } from './types/policy-engine'

export const buildJwsdHeader = (args: JwsdHeaderArgs): JwsdHeader => {
  const { uri, htm, jwk, alg, accessToken } = args

  if (!jwk.kid || !alg) {
    throw new ArmorySdkException('kid and alg are required', {
      context: {
        kid: jwk.kid,
        alg,
        args
      }
    })
  }

  return {
    alg,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm,
    uri,
    created: new Date().getTime(),
    ath: hexToBase64Url(hash(accessToken.value))
  }
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress.toLowerCase()}`
  }
  return walletIdOrAddress
}

export const buildRequestPayload = (
  request: Request,
  opts: {
    iss?: string
    sub?: string
    iat?: number
  } = {}
): Payload => {
  return {
    requestHash: hash(request),
    sub: opts.sub,
    iss: opts.iss,
    iat: opts.iat || new Date().getTime()
  }
}

export const buildDataPayload = (
  data: unknown,
  opts: {
    iss?: string
    sub?: string
    iat?: number
  } = {}
): Payload => {
  return {
    data: hash(data),
    sub: opts.sub,
    iss: opts.iss,
    iat: opts.iat || new Date().getTime()
  }
}

export const checkDecision = (data: EvaluationResponse, config: ArmoryClientConfig): SendEvaluationResponse => {
  switch (data.decision) {
    case Decision.PERMIT:
      if (!data.accessToken || !data.accessToken.value) {
        throw new ArmorySdkException('Access token or validated request is missing', {
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

export const getChainOrThrow = (chainId: number): Chain => {
  switch (chainId) {
    case 1:
      return mainnet
    case 137:
      return polygon
    case 10:
      return optimism
    default:
      throw new ArmorySdkException('Unsupported chain', {
        chainId
      })
  }
}

export const walletId = (input: { walletId?: string; privateKey: Hex }): { walletId: string; privateKey: Hex } => {
  const { walletId, privateKey } = input

  if (!walletId) {
    return {
      ...input,
      walletId: `wallet:${v4()}`
    }
  }

  return {
    walletId,
    privateKey
  }
}

export const builBasicHeaders = (config: { clientId: string; clientSecret: string }): BasicHeaders => {
  return {
    [HEADER_CLIENT_ID]: config.clientId,
    [HEADER_CLIENT_SECRET]: config.clientSecret
  }
}

export const buildGnapVaultHeaders = (config: {
  vaultClientId: string
  accessToken: JwtString
  detachedJws: string
}): GnapHeaders => {
  return {
    [HEADER_CLIENT_ID]: config.vaultClientId,
    [DETACHED_JWS]: config.detachedJws,
    authorization: `GNAP ${config.accessToken}`
  }
}

export const isSuccessResponse = (status: number): boolean => status >= 200 && status < 300

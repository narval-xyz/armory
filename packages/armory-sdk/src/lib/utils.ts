import {
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Request,
  isAddress
} from '@narval/policy-engine-shared'
import { JwsdHeader, Payload, buildSignerForAlg, hash, hexToBase64Url, signJwsd, signJwt } from '@narval/signature'
import { v4 } from 'uuid'
import { Address, Chain, Hex } from 'viem'
import { mainnet, optimism, polygon } from 'viem/chains'
import { DETACHED_JWS, HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from './constants'
import { EngineClientConfig, JwsdHeaderArgs, SignAccountJwsdArgs } from './domain'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from './exceptions'
import { BasicHeaders, GnapHeaders } from './schema'
import { SendEvaluationResponse } from './types/policy-engine'

export const buildJwsdHeader = (args: JwsdHeaderArgs): JwsdHeader => {
  const { uri, htm, jwk, alg, accessToken } = args

  if (!jwk.kid || !alg) {
    throw new NarvalSdkException('kid and alg are required', {
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

export const signAccountJwsd = async (args: SignAccountJwsdArgs) => {
  const { payload, accessToken, jwk, uri, htm } = args

  let signer = args.signer
  let alg = args.alg

  if (!signer) {
    signer = await buildSignerForAlg(jwk)
    alg = jwk.alg
  }

  const jwsdHeader = buildJwsdHeader({ accessToken, jwk, alg, uri, htm })

  return signJwsd(payload, jwsdHeader, signer).then((jws) => {
    const parts = jws.split('.')
    parts[1] = ''
    return parts.join('.')
  })
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress}`
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

export const signRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<EvaluationRequest> => {
  const payload = buildRequestPayload(request.request, {
    sub: config.jwk.kid,
    iss: config.authClientId
  })
  const authentication = await signJwt(payload, config.jwk, { alg: config.alg }, config.signer)

  return {
    sessionId: v4(), // A unique session id, used in mpc
    ...request,
    authentication
  }
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

export const buildBasicEngineHeaders = (config: EngineClientConfig): BasicHeaders => {
  return {
    [HEADER_CLIENT_ID]: config.authClientId,
    [HEADER_CLIENT_SECRET]: config.authSecret
  }
}

export const buildGnapVaultHeaders = (
  vaultClientId: string,
  accessToken: JwtString,
  detachedJws: string
): GnapHeaders => {
  return {
    [HEADER_CLIENT_ID]: vaultClientId,
    [DETACHED_JWS]: detachedJws,
    authorization: `GNAP ${accessToken}`
  }
}

export const isSuccessResponse = (status: number): boolean => status >= 200 && status < 300

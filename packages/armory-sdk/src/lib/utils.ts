import {
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Request,
  isAddress
} from '@narval/policy-engine-shared'
import { JwsdHeader, Payload, buildSignerForAlg, hash, hexToBase64Url, signJwsd, signJwt,   PrivateKey,
  SigningAlg, } from '@narval/signature'
import { v4 } from 'uuid'
import { Address, Chain, Hex } from 'viem'
import { mainnet, optimism, polygon } from 'viem/chains'
import {
  EngineClientConfig,
  JwsdHeaderArgs,
  SdkEvaluationResponse,
  SdkPermitResponse,
  SignAccountJwsdArgs,
  VaultClientConfig
} from './domain'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from './exceptions'
import { BasicHeaders, GnapHeaders } from './http/schema'

export const buildJwsdHeader = (args: JwsdHeaderArgs): JwsdHeader => {
  const { uri, htm, jwk, accessToken } = args
  if (!jwk.kid || !jwk.alg) {
    throw new NarvalSdkException('jwk.kid and jwk.alg are required', {
      context: {
        kid: jwk.kid,
        alg: jwk.alg,
        args
      }
    })
  }
  return {
    alg: jwk.alg,
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
  const jwsdHeader = buildJwsdHeader({ uri, htm, jwk, accessToken })

  const signer = await buildSignerForAlg(jwk)

  const signature = await signJwsd(payload, jwsdHeader, signer)
  return signature
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress}`
  }
  return walletIdOrAddress
}

export const buildPayloadFromRequest = (config: EngineClientConfig, request: Request): Payload => {
  return {
    requestHash: hash(request),
    sub: config.signer.kid,
    iss: config.authClientId,
    iat: new Date().getTime()
  }
}

export const signRequest = async (config: EngineClientConfig, request: Request): Promise<EvaluationRequest> => {
  const payload = buildPayloadFromRequest(config, request)

  const authentication = await signJwt(payload, config.signer)
  return {
    authentication,
    request
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
  const hashed = hash(data)
  return {
    data: hashed,
    sub: opts.sub,
    iss: opts.iss,
    iat: opts.iat || new Date().getTime()
  }
}

export const signData = async (
  signer: PrivateKey,
  data: unknown,
  opts: {
    iss?: string
    sub?: string
    iat?: number
    alg?: SigningAlg
  } = {}
): Promise<JwtString> => {
  const payload = buildDataPayload(data, opts)

  const authentication = await signJwt(payload, signer, { alg: opts.alg })
  return authentication
}

export const checkDecision = (data: EvaluationResponse, config: EngineClientConfig): SdkEvaluationResponse => {
  switch (data.decision) {
    case Decision.PERMIT:
      if (!data.accessToken || !data.accessToken.value) {
        throw new NarvalSdkException('Access token or validated request is missing', {
          evaluation: data,
          authHost: config.authHost,
          authClientId: config.authClientId
        })
      }
      return SdkPermitResponse.parse(data)
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

export const buildBasicAuthHeaders = (config: EngineClientConfig): BasicHeaders => {
  return {
    'x-client-id': config.authClientId,
    'x-client-secret': config.authSecret
  }
}

export const buildGnapVaultHeaders = (
  config: VaultClientConfig,
  accessToken: JwtString,
  detachedJws: string
): GnapHeaders => {
  return {
    'x-client-id': config.vaultClientId,
    'detached-jws': detachedJws,
    authorization: `GNAP ${accessToken}`
  }
}

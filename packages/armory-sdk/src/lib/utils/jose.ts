import {
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Request,
  isAddress
} from '@narval/policy-engine-shared'
import { JwsdHeader, Payload, buildSignerForAlg, hash, hexToBase64Url, signJwsd, signJwt } from '@narval/signature'
import { Address, Chain, Hex } from 'viem'
import { EngineClientConfig, JwsdHeaderArgs, SignAccountJwsdArgs } from '../domain'
import { buildJwsdHeader } from './headers'


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
    ...request,
    authentication
  }
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
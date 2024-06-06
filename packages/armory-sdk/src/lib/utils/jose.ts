import { EvaluationRequest, Request } from '@narval/policy-engine-shared'
import { Payload, hash, signJwt } from '@narval/signature'
import { EngineClientConfig } from '../domain'

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

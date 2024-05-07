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
import { Address } from 'viem'
import {
  EngineClientConfig,
  ImportPrivateKeyRequest,
  JwsdHeaderArgs,
  SdkEvaluationResponse,
  SdkPermitResponse,
  SignAccountJwsdArgs,
  VaultClientConfig
} from './domain'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from './exceptions'
import { BasicHeaders, SignatureRequestHeaders } from './http/schema'

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

export const buildDataPayload = (config: EngineClientConfig, data: unknown): Payload => {
  const hashed = hash(data)
  return {
    data: hashed,
    sub: config.signer.kid,
    iss: config.authClientId,
    iat: new Date().getTime()
  }
}

export const signData = async (config: EngineClientConfig, data: unknown): Promise<JwtString> => {
  const payload = buildDataPayload(config, data)

  const authentication = await signJwt(payload, config.signer)
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

export const walletId = (input: ImportPrivateKeyRequest): ImportPrivateKeyRequest => {
  if (!input.walletId) {
    return {
      ...input,
      walletId: `wallet:${v4()}`
    }
  }
  return input
}

export const buildBasicAuthHeaders = (config: EngineClientConfig): BasicHeaders => {
  return {
    'x-client-id': config.authClientId,
    'x-client-secret': config.authSecret
  }
}

export const buildBasicVaultHeaders = (config: VaultClientConfig): BasicHeaders => {
  return {
    'x-client-id': config.vaultClientId,
    'x-client-secret': config.vaultSecret
  }
}

export const buildGnapVaultHeaders = (
  config: VaultClientConfig,
  accessToken: JwtString,
  detachedJws: string
): SignatureRequestHeaders => {
  return {
    'x-client-id': config.vaultClientId,
    'detached-jws': detachedJws,
    authorization: `GNAP ${accessToken}`
  }
}

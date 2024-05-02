import {
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Request,
  isAddress
} from '@narval/policy-engine-shared'
import {
  Jwk,
  JwsdHeader,
  Payload,
  SigningAlg,
  buildSignerEs256k,
  hash,
  hexToBase64Url,
  privateKeyToHex,
  signJwsd,
  signJwt
} from '@narval/signature'
import { v4 } from 'uuid'
import { Address, LocalAccount } from 'viem'
import { ArmoryClientConfig, ImportPrivateKeyRequest, SdkEvaluationResponse, SdkPermitResponse } from './domain'
import { ForbiddenException, NarvalSdkException, NotImplementedException } from './exceptions'
import { BasicHeaders, SignatureRequestHeaders } from './http/schema'

export type VaultAccount = LocalAccount & {
  jwk: Jwk
}

export const signScopedJwsd = async (payload: Payload, accessToken: string, jwk: Jwk, uri: string) => {
  if (!jwk.kid) {
    throw new Error('kid is required')
  }

  const privateKey = await privateKeyToHex(jwk)
  const signer = buildSignerEs256k(privateKey)

  const jwsdHeader: JwsdHeader = {
    alg: SigningAlg.ES256K,
    kid: jwk.kid,
    typ: 'gnap-binding-jwsd',
    htm: 'POST',
    uri,
    created: new Date().getTime(),
    ath: hexToBase64Url(hash(accessToken))
  }

  const signature = await signJwsd(payload, jwsdHeader, signer)
  return signature
}

export const resourceId = (walletIdOrAddress: Address | string): string => {
  if (isAddress(walletIdOrAddress)) {
    return `eip155:eoa:${walletIdOrAddress}`
  }
  return walletIdOrAddress
}

const buildPayloadFromRequest = (config: ArmoryClientConfig, request: Request): Payload => {
  return {
    requestHash: hash(request),
    sub: config.signer.kid,
    iss: config.authClientId,
    iat: new Date().getTime()
  }
}

export const signRequest = async (config: ArmoryClientConfig, request: Request): Promise<EvaluationRequest> => {
  const payload = buildPayloadFromRequest(config, request)
  const authentication = await signJwt(payload, config.signer)

  return {
    authentication,
    request
  }
}

export const signData = async (config: ArmoryClientConfig, data: unknown): Promise<JwtString> => {
  const hashed = hash(data)
  const payload = {
    data: hashed,
    sub: config.signer.kid,
    iss: config.authClientId,
    iat: new Date().getTime()
  }
  const authentication = await signJwt(payload, config.signer)
  return authentication
}

export const checkDecision = (data: EvaluationResponse, config: ArmoryClientConfig): SdkEvaluationResponse => {
  switch (data.decision) {
    case Decision.PERMIT:
      if (!data.accessToken || !data.accessToken.value || !data.request) {
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

export const buildBasicHeaders = (config: ArmoryClientConfig): BasicHeaders => {
  return {
    'x-client-id': config.authClientId,
    'x-client-secret': config.authSecret
  }
}

export const buildGnapScopedHeaders = (
  config: ArmoryClientConfig,
  accessToken: JwtString,
  detachedJws: string
): SignatureRequestHeaders => {
  return {
    'x-client-id': config.vaultClientId,
    'detached-jws': detachedJws,
    authorization: `GNAP ${accessToken}`
  }
}

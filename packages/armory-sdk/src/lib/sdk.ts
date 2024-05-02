import { Request } from '@narval/policy-engine-shared'
import {
  ArmoryClientConfig,
  Endpoints,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  SdkEvaluationResponse,
  SignatureRequest,
  SignatureResponse
} from './domain'
import { sendEvaluationRequest } from './http/engine'
import { sendImportPrivateKey, sendSignatureRequest } from './http/vault'
import {
  buildBasicHeaders,
  buildGnapScopedHeaders,
  checkDecision,
  signRequest,
  signScopedJwsd,
  walletId
} from './utils'

export const evaluate = async (config: ArmoryClientConfig, request: Request): Promise<SdkEvaluationResponse> => {
  const body = await signRequest(config, request)

  const headers = {
    'x-client-id': config.authClientId,
    'x-client-secret': config.authSecret
  }

  const uri = `${config.authHost}${Endpoints.engine.evaluations}`

  const data = await sendEvaluationRequest({
    uri,
    headers,
    request: body
  })
  return checkDecision(data, config)
}

export const importPrivateKey = async (
  config: ArmoryClientConfig,
  request: ImportPrivateKeyRequest
): Promise<ImportPrivateKeyResponse> => {
  const validatedRequest = walletId(request)

  const headers = buildBasicHeaders(config)

  const uri = `${config.vaultHost}${Endpoints.vault.importPrivateKey}`
  const data = await sendImportPrivateKey({
    uri,
    headers,
    request: validatedRequest
  })
  return data
}

export const signatureRequest = async (
  config: ArmoryClientConfig,
  input: SignatureRequest
): Promise<SignatureResponse> => {
  const { request, accessToken } = input

  const uri = `${config.vaultHost}${Endpoints.vault.sign}`

  const detachedJws = await signScopedJwsd(
    {
      request
    },
    accessToken.value,
    config.signer,
    uri
  )

  const headers = buildGnapScopedHeaders(config, accessToken.value, detachedJws)

  const data = await sendSignatureRequest({
    request,
    headers,
    uri
  })

  return data
}

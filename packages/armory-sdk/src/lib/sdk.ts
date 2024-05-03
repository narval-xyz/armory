import { Request } from '@narval/policy-engine-shared'
import {
  ArmoryClientConfig,
  ArmoryClientConfigInput,
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
  buildBasicVaultHeaders,
  buildGnapScopedHeaders,
  checkDecision,
  signRequest as signRequestHelper,
  signScopedJwsd,
  walletId
} from './utils'

export const createArmoryConfig = (config: ArmoryClientConfigInput): ArmoryClientConfig => {
  const authClientId = config.authClientId || process.env.ARMORY_CLIENT_ID
  const authSecret = config.authSecret || process.env.ARMORY_AUTH_SECRET
  const vaultClientId = config.vaultClientId || process.env.ARMORY_VAULT_CLIENT_ID
  const vaultSecret = config.vaultSecret || process.env.ARMORY_VAULT_SECRET

  const authHost = config.authHost || `https://cloud.narval.xyz/auth`
  const vaultHost = config.vaultHost || `https://cloud.narval.xyz/vault`
  const entityStoreHost = config.entityStoreHost || `https://cloud.narval.xyz/auth`
  const policyStoreHost = config.policyStoreHost || `https://cloud.narval.xyz/auth`

  const confirmedConfig = ArmoryClientConfig.parse({
    authHost,
    vaultHost,
    authSecret,
    vaultClientId,
    vaultSecret,
    entityStoreHost,
    policyStoreHost,
    authClientId,
    signer: config.signer
  })

  return confirmedConfig
}

/**
 * @param config
 * @param request
 * @returns SdkEvaluationResponse
 */
export const evaluate = async (config: ArmoryClientConfig, request: Request): Promise<SdkEvaluationResponse> => {
  const body = await signRequestHelper(config, request)

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

/**
 * @param config
 * @param request
 * @returns ImportPrivateKeyResponse
 */
export const importPrivateKey = async (
  config: ArmoryClientConfig,
  request: ImportPrivateKeyRequest
): Promise<ImportPrivateKeyResponse> => {
  const validatedRequest = walletId(request)

  const headers = buildBasicVaultHeaders(config)

  const uri = `${config.vaultHost}${Endpoints.vault.importPrivateKey}`
  const data = await sendImportPrivateKey({
    uri,
    headers,
    request: validatedRequest
  })
  return data
}

/**
 * @param config
 * @param input
 * @returns SignatureResponse
 */
export const signRequest = async (config: ArmoryClientConfig, input: SignatureRequest): Promise<SignatureResponse> => {
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

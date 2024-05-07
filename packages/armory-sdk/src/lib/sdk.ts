import { Request } from '@narval/policy-engine-shared'
import {
  ArmoryClientConfig,
  ArmoryClientConfigInput,
  Endpoints,
  EngineClientConfig,
  Htm,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  SdkEvaluationResponse,
  SignatureRequest,
  SignatureResponse,
  VaultClientConfig
} from './domain'
import { sendEvaluationRequest } from './http/policy-engine'
import { sendImportPrivateKey, sendSignatureRequest } from './http/vault'
import {
  buildBasicVaultHeaders,
  buildGnapVaultHeaders,
  checkDecision,
  signAccountJwsd,
  signRequest as signRequestHelper,
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
 * Evaluates a request using the Armory SDK.
 * @param config - The Armory client configuration.
 * @param request - The request to be evaluated.
 * @returns A promise that resolves to the SDK evaluation response.
 */
export const evaluate = async (config: EngineClientConfig, request: Request): Promise<SdkEvaluationResponse> => {
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
 * Imports a private key using the Armory SDK.
 *
 * @param config - The Armory client configuration.
 * @param request - The import private key request.
 * @returns A promise that resolves to the import private key response.
 */
export const importPrivateKey = async (
  config: VaultClientConfig,
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
 * Signs a request using the Armory SDK.
 * @param config - The Armory client configuration.
 * @param input - The signature request input.
 * @returns A promise that resolves to the signature response.
 */
export const signRequest = async (config: VaultClientConfig, input: SignatureRequest): Promise<SignatureResponse> => {
  const { request, accessToken } = input

  const uri = `${config.vaultHost}${Endpoints.vault.sign}`

  const payload = {
    request
  }
  const detachedJws = await signAccountJwsd({
    payload,
    uri,
    htm: Htm.POST,
    accessToken,
    jwk: config.signer
  })

  const headers = buildGnapVaultHeaders(config, accessToken.value, detachedJws)

  const data = await sendSignatureRequest({
    request,
    headers,
    uri
  })

  return data
}

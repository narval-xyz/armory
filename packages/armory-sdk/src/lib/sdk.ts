import { Action, EntityStore, PolicyStore, Request, SignTransactionAction, TransactionRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import axios from 'axios'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import {
  ArmoryClientConfig,
  ArmoryClientConfigInput,
  Endpoints,
  EngineClientConfig,
  Htm,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  Permission,
  SdkEvaluationResponse,
  SetEntityRequest,
  SetPolicyRequest,
  SignatureRequest,
  SignatureResponse,
  VaultClientConfig
} from './domain'
import { NarvalSdkException } from './exceptions'
import { sendEvaluationRequest } from './http/policy-engine'
import { sendImportPrivateKey, sendSignatureRequest } from './http/vault'
import {
  buildBasicEngineHeaders,
  buildGnapVaultHeaders,
  checkDecision,
  getChainOrThrow,
  resourceId,
  signAccountJwsd,
  signData,
  signRequest as signRequestHelper
} from './utils'

export const createArmoryConfig = (config: ArmoryClientConfigInput): ArmoryClientConfig => {
  const authClientId = config.authClientId || process.env.ARMORY_CLIENT_ID
  const authSecret = config.authSecret || process.env.ARMORY_AUTH_SECRET
  const vaultClientId = config.vaultClientId || process.env.ARMORY_VAULT_CLIENT_ID

  const authHost = config.authHost || `https://cloud.narval.xyz/auth`
  const vaultHost = config.vaultHost || `https://cloud.narval.xyz/vault`
  const entityStoreHost = config.entityStoreHost || `https://cloud.narval.xyz/auth`
  const policyStoreHost = config.policyStoreHost || `https://cloud.narval.xyz/auth`

  const confirmedConfig = ArmoryClientConfig.parse({
    authHost,
    vaultHost,
    authSecret,
    vaultClientId,
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
  config: ArmoryClientConfig,
  request: ImportPrivateKeyRequest
): Promise<ImportPrivateKeyResponse> => {
  const walletId = resourceId(request.walletId || privateKeyToAddress(request.privateKey))

  const validatedRequest = {
    privateKey: request.privateKey,
    walletId
  }

  const grantPermissionRequest: Request = {
    action: Action.GRANT_PERMISSION,
    resourceId: validatedRequest.walletId,
    nonce: v4(),
    permissions: [Permission.WALLET_CREATE]
  }
  const { accessToken } = await evaluate(config, grantPermissionRequest)

  const uri = `${config.vaultHost}${Endpoints.vault.importPrivateKey}`

  const detachedJws = await signAccountJwsd({
    payload: validatedRequest,
    uri,
    htm: Htm.POST,
    accessToken,
    jwk: config.signer
  })

  const headers = buildGnapVaultHeaders(config, accessToken.value, detachedJws)

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

export const syncDataStores = async (config: EngineClientConfig) => {
  const { authHost } = config
  const headers = buildBasicEngineHeaders(config)

  const { data } = await axios.post(`${authHost}${Endpoints.engine.sync}`, null, {
    headers
  })
  if (!data.ok) {
    throw new NarvalSdkException('Failed to sync engine', {
      config,
      engineError: data
    })
  }
}

export const setPolicies = async (
  config: EngineClientConfig & {
    policyStoreHost: string
  },
  input: SetPolicyRequest
): Promise<{ success: boolean }> => {
  const headers = buildBasicEngineHeaders(config)
  const { privateKey, policies } = input
  const { policyStoreHost } = config

  const signature = await signData(privateKey, policies, {
    sub: privateKey.kid,
    iss: config.authClientId,
    alg: SigningAlg.EIP191
  })

  const policy: PolicyStore = {
    data: input.policies,
    signature
  }

  try {
    const res = await axios.post(policyStoreHost, { policy }, { headers })
    if (res.status !== 200) {
      throw new NarvalSdkException('Failed to set policies', {
        config,
        input,
        storeResponse: res.data
      })
    }
  } catch (error) {
    throw new NarvalSdkException('Failed to set policies', {
      config,
      input,
      error
    })
  }
  try {
    // TODO: remove manual sync after https://linear.app/narval/issue/NAR-1623
    await syncDataStores(config)
    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine after setting policies', {
      config,
      input,
      error
    })
  }
}

export const setEntities = async (
  config: EngineClientConfig & {
    entityStoreHost: string
  },
  input: SetEntityRequest
): Promise<{ success: boolean }> => {
  const headers = buildBasicEngineHeaders(config)
  const { privateKey, entity: entities } = input

  const { entityStoreHost } = config

  const signature = await signData(privateKey, entities, {
    sub: privateKey.kid,
    iss: config.authClientId,
    alg: SigningAlg.EIP191
  })

  const entity: EntityStore = {
    data: entities.entity.data,
    signature
  }

  const res = await axios.post(entityStoreHost, { entity }, { headers })
  if (res.status !== 200) {
    throw new NarvalSdkException('Failed to set entities', {
      config,
      input,
      storeResponse: res.data
    })
  }
  try {
    await syncDataStores(config)
    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine after setting entities', {
      config,
      input,
      error,
      storeResponse: res.data
    })
  }
}

export const sendTransaction = async (
  config: ArmoryClientConfig,
  transactionRequest: TransactionRequest
): Promise<Hex> => {
  const request: SignTransactionAction = {
    action: Action.SIGN_TRANSACTION,
    resourceId: resourceId(transactionRequest.from),
    nonce: v4(),
    transactionRequest
  }
  const { accessToken } = await evaluate(config, request)
  const { signature } = await signRequest(config, { request, accessToken })

  const chain = getChainOrThrow(transactionRequest.chainId)
  const publicClient = createPublicClient({
    transport: http(),
    chain
  })

  const hash = await publicClient.sendRawTransaction({ serializedTransaction: signature })
  return hash
}

import {
  Action,
  Entities,
  EntityStore,
  JwtString,
  Policy,
  PolicyStore,
  Request,
  SignTransactionAction,
  TransactionRequest
} from '@narval/policy-engine-shared'
import { signJwt } from '@narval/signature'
import axios from 'axios'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { HEADER_CLIENT_ID } from './constants'
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
  SignatureRequest,
  SignatureResponse,
  VaultClientConfig
} from './domain'
import { NarvalSdkException } from './exceptions'
import { sendEvaluationRequest } from './http/policy-engine'
import { sendImportPrivateKey, sendSignatureRequest } from './http/vault'
import {
  buildBasicEngineHeaders,
  buildDataPayload,
  buildGnapVaultHeaders,
  checkDecision,
  getChainOrThrow,
  resourceId,
  signAccountJwsd,
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
    authClientId,
    authSecret,
    vaultHost,
    vaultClientId,
    entityStoreHost,
    policyStoreHost,
    jwk: config.jwk,
    alg: config.alg,
    signer: config.signer
  })

  return confirmedConfig
}

export const pingEngine = async (config: EngineClientConfig): Promise<void> => {
  try {
    await axios.get(config.authHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping engine', { config, error })
  }
}

export const pingVault = async (config: VaultClientConfig): Promise<void> => {
  try {
    await axios.get(config.vaultHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping vault', { config, error })
  }
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
    [HEADER_CLIENT_ID]: config.authClientId
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
    jwk: config.jwk,
    alg: config.alg,
    signer: config.signer
  })

  const headers = buildGnapVaultHeaders(config.vaultClientId, accessToken.value, detachedJws)

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
    accessToken,
    htm: Htm.POST,
    jwk: config.jwk,
    alg: config.alg,
    signer: config.signer
  })

  const headers = buildGnapVaultHeaders(config.vaultClientId, accessToken.value, detachedJws)

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

  try {
    const { data } = await axios.post(`${authHost}${Endpoints.engine.sync}`, null, {
      headers
    })
    return data.ok
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine', { config, error })
  }
}

export const getEntities = async (entityStoreHost: string): Promise<EntityStore> => {
  try {
    const {
      data: { entity }
    } = await axios.get(entityStoreHost)

    return entity
  } catch (error) {
    throw new NarvalSdkException('Failed to ping entity store', { entityStoreHost, error })
  }
}

export const getPolicies = async (policyStoreHost: string): Promise<PolicyStore> => {
  try {
    const {
      data: { policy }
    } = await axios.get(policyStoreHost)

    return policy
  } catch (error) {
    throw new NarvalSdkException('Failed to ping policy store', { policyStoreHost, error })
  }
}

export const setEntities = async (
  config: EngineClientConfig & {
    entityStoreHost: string
  },
  data: Entities
): Promise<{ success: boolean }> => {
  const headers = buildBasicEngineHeaders(config)
  const signature = await signData(config, data)
  const entity: EntityStore = { data, signature }

  try {
    const res = await axios.post(config.entityStoreHost, { entity }, { headers })

    if (res.status !== 200) {
      throw new NarvalSdkException('Failed to set entities', {
        config,
        data,
        storeResponse: res.data
      })
    }
  } catch (error) {
    throw new NarvalSdkException('Failed to set entities', {
      config,
      data,
      error
    })
  }

  try {
    await syncDataStores(config)

    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine after setting entities', {
      config,
      data,
      error
    })
  }
}

export const setPolicies = async (
  config: EngineClientConfig & {
    policyStoreHost: string
  },
  data: Policy[]
): Promise<{ success: boolean }> => {
  const headers = buildBasicEngineHeaders(config)
  const signature = await signData(config, data)
  const policy: PolicyStore = { data, signature }

  try {
    const res = await axios.post(config.policyStoreHost, { policy }, { headers })

    if (res.status !== 200) {
      throw new NarvalSdkException('Failed to set policies', {
        config,
        data,
        storeResponse: res.data
      })
    }
  } catch (error) {
    throw new NarvalSdkException('Failed to set policies', {
      config,
      data,
      error
    })
  }

  try {
    await syncDataStores(config)

    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine after setting policies', {
      config,
      data,
      error
    })
  }
}

export const signData = async (config: EngineClientConfig, data: unknown): Promise<JwtString> => {
  const payload = buildDataPayload(data, {
    sub: config.jwk.kid,
    iss: config.authClientId
  })

  return signJwt(payload, config.jwk, { alg: config.alg }, config.signer)
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

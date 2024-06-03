import { SerializedRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { privateKeyToAddress } from 'viem/accounts'
import {
  ArmoryClientConfig,
  Endpoints,
  Htm,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  SignatureRequest,
  SignatureResponse,
  VaultClientConfig
} from '../domain'
import { NarvalSdkException } from '../exceptions'
import { buildGnapVaultHeaders, resourceId, signAccountJwsd } from '../utils'

export const pingVault = async (config: VaultClientConfig): Promise<void> => {
  try {
    return axios.get(config.vaultHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping vault', { config, error })
  }
}

export const signRequest = async (
  config: VaultClientConfig,
  { request, accessToken }: SignatureRequest
): Promise<SignatureResponse> => {
  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}${Endpoints.vault.sign}`

    const detachedJws = await signAccountJwsd({
      payload: { request },
      uri,
      accessToken,
      htm: Htm.POST,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post(
      uri,
      { request: SerializedRequest.parse(request) },
      { headers: buildGnapVaultHeaders(vaultClientId, accessToken.value, detachedJws) }
    )

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to sign request', { config, payload: { request, accessToken }, error })
  }
}

export const importPrivateKey = async (
  config: ArmoryClientConfig,
  request: ImportPrivateKeyRequest
): Promise<ImportPrivateKeyResponse> => {
  const { privateKey, accessToken } = request
  const walletId = resourceId(request.walletId || privateKeyToAddress(privateKey))
  const payload = { privateKey, walletId }

  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    // if (!accessToken || !accessToken.value) {
    //   const grantPermissionRequest = EvaluationRequest.parse({
    //     authentication: 'missing',
    //     request: {
    //       action: Action.GRANT_PERMISSION,
    //       resourceId: walletId,
    //       nonce: v4(),
    //       permissions: [Permission.WALLET_CREATE]
    //     }
    //   })
    //   const evaluationResponse = await sendEvaluationRequest(config, grantPermissionRequest)

    //   if (!evaluationResponse.accessToken) {
    //     return SdkEvaluationResponse.parse(evaluationResponse)
    //   }

    //   accessToken = evaluationResponse.accessToken
    // }

    const uri = `${vaultHost}${Endpoints.vault.importPrivateKey}`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post(uri, payload, {
      headers: buildGnapVaultHeaders(vaultClientId, accessToken.value, detachedJws)
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to import private key', { config, payload, error })
  }
}

import { SerializedRequest } from '@narval/policy-engine-shared'
import { rsaEncrypt } from '@narval/signature'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY } from '../constants'
import { Htm, VaultAdminConfig, VaultClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import {
  DeriveWalletRequest,
  DeriveWalletResponse,
  GenerateEncryptionKeyRequest,
  GenerateEncryptionKeyResponse,
  GenerateKeyRequest,
  GenerateKeyResponse,
  ImportPrivateKeyRequest,
  ImportPrivateKeyResponse,
  ImportSeedRequest,
  ImportSeedResponse,
  OnboardVaultClientRequest,
  OnboardVaultClientResponse,
  SignatureRequest,
  SignatureResponse
} from '../types/vault'
import { buildGnapVaultHeaders, signAccountJwsd } from '../utils'

export const pingVault = async (config: VaultClientConfig): Promise<void> => {
  try {
    return axios.get(config.vaultHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping vault', { config, error })
  }
}

export const onboardVaultClient = async (
  config: VaultAdminConfig,
  request: OnboardVaultClientRequest
): Promise<OnboardVaultClientResponse> => {
  const { vaultHost, adminApiKey } = config

  try {
    const { data } = await axios.post<OnboardVaultClientResponse>(`${vaultHost}/clients`, request, {
      headers: {
        [HEADER_ADMIN_API_KEY]: adminApiKey
      }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to onboard client', { config, error })
  }
}

export const signRequest = async (
  config: VaultClientConfig,
  { request, accessToken }: SignatureRequest
): Promise<SignatureResponse> => {
  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/sign`

    const detachedJws = await signAccountJwsd({
      payload: { request },
      uri,
      accessToken,
      htm: Htm.POST,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<SignatureResponse>(
      uri,
      { request: SerializedRequest.parse(request) },
      { headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws }) }
    )

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to sign request', { config, error })
  }
}

export const generateEncryptionKey = async (
  config: VaultClientConfig,
  { accessToken, ...payload }: GenerateEncryptionKeyRequest
): Promise<GenerateEncryptionKeyResponse> => {
  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/import/encryption-keys`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<GenerateEncryptionKeyResponse>(uri, payload, {
      headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws })
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to generate encryption key', { config, error })
  }
}

export const importPrivateKey = async (
  config: VaultClientConfig,
  { accessToken, privateKey }: ImportPrivateKeyRequest
): Promise<ImportPrivateKeyResponse> => {
  try {
    const { publicKey: rsaEncryptionKey } = await generateEncryptionKey(config, { accessToken })
    const encryptedPrivateKey = await rsaEncrypt(privateKey, rsaEncryptionKey)
    const payload = { encryptedPrivateKey }

    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/import/private-keys`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<ImportPrivateKeyResponse>(uri, payload, {
      headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws })
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to import private key', { config, error })
  }
}

export const importSeed = async (
  config: VaultClientConfig,
  { accessToken, seed }: ImportSeedRequest
): Promise<ImportSeedResponse> => {
  try {
    const { publicKey: rsaEncryptionKey } = await generateEncryptionKey(config, { accessToken })
    const encryptedSeed = await rsaEncrypt(seed, rsaEncryptionKey)
    const payload = { encryptedSeed }

    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/import/seeds`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<ImportSeedResponse>(uri, payload, {
      headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws })
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to import seed', { config, error })
  }
}

export const generateKey = async (
  config: VaultClientConfig,
  { accessToken, ...payload }: GenerateKeyRequest
): Promise<GenerateKeyResponse> => {
  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/generate/keys`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<GenerateKeyResponse>(uri, payload, {
      headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws })
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to generate key', { config, error })
  }
}

export const deriveWallet = async (config: VaultClientConfig, { accessToken, ...payload }: DeriveWalletRequest) => {
  try {
    const { vaultHost, vaultClientId, jwk, alg, signer } = config

    const uri = `${vaultHost}/derive/wallets`

    const detachedJws = await signAccountJwsd({
      payload,
      uri,
      htm: Htm.POST,
      accessToken,
      jwk,
      alg,
      signer
    })

    const { data } = await axios.post<DeriveWalletResponse>(uri, payload, {
      headers: buildGnapVaultHeaders({ vaultClientId, accessToken: accessToken.value, detachedJws })
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to derive wallet', { config, error })
  }
}

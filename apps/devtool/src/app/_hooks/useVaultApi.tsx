import {
  ArmoryClientConfig,
  ImportPrivateKeyRequest,
  VaultClientConfig,
  importPrivateKey,
  pingVault,
  signRequest
} from '@narval/armory-sdk'
import { Request } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useDataStoreApi from './useDataStoreApi'
import useEngineApi from './useEngineApi'
import useStore from './useStore'

export interface VaultClientData {
  vaultUrl: string
  vaultAdminApiKey: string
  engineClientSigner: string
  clientId: string
  backupPublicKey: string
  allowKeyExport: boolean
  audience: string
  issuer: string
  maxTokenAge: string
}

const useVaultApi = () => {
  const { vaultUrl: vaultHost, vaultClientId: vaultClientId } = useStore()
  const { jwk, signer } = useAccountSignature()
  const { sdkEngineConfig } = useEngineApi()
  const { sdkDataStoreConfig } = useDataStoreApi()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string>()

  const sdkArmoryConfig = useMemo<ArmoryClientConfig | null>(() => {
    if (!sdkEngineConfig || !sdkDataStoreConfig) {
      return null
    }

    return {
      ...sdkEngineConfig,
      ...sdkDataStoreConfig,
      vaultHost,
      vaultClientId
    }
  }, [sdkEngineConfig, sdkDataStoreConfig])

  const sdkVaultConfig = useMemo<VaultClientConfig | null>(() => {
    if (!vaultHost || !vaultClientId || !jwk || !signer) {
      return null
    }

    return {
      vaultHost,
      vaultClientId,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [vaultHost, vaultClientId, jwk, signer])

  const ping = async () => {
    if (!sdkVaultConfig) return

    try {
      await pingVault(sdkVaultConfig)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboardClient = async (vaultClientData: VaultClientData) => {
    setErrors(undefined)

    try {
      const {
        vaultUrl,
        vaultAdminApiKey,
        engineClientSigner,
        backupPublicKey,
        allowKeyExport,
        audience,
        issuer,
        maxTokenAge
      } = vaultClientData

      const { data: client } = await axios.post(
        `${vaultUrl}/clients`,
        {
          ...(engineClientSigner && { engineJwk: JSON.parse(engineClientSigner) }),
          ...(backupPublicKey && { backupJwk: JSON.parse(backupPublicKey) }),
          ...(allowKeyExport && { allowKeyExport }),
          ...(audience && { audience }),
          ...(issuer && { issuer }),
          ...(maxTokenAge && { maxTokenAge: Number(maxTokenAge) })
        },
        {
          headers: {
            'x-api-key': vaultAdminApiKey
          }
        }
      )

      setIsProcessing(false)

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setIsProcessing(false)
    }
  }

  const sign = async (payload: { accessToken: { value: string }; request: Request }) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return signRequest(sdkVaultConfig, payload)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const importPK = async (request: ImportPrivateKeyRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      return importPrivateKey(sdkArmoryConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, errors, ping, onboardClient, sign, importPK }
}

export default useVaultApi

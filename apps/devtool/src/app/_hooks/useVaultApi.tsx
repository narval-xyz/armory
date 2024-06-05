import {
  ArmoryClientConfig,
  DeriveWalletRequest,
  GenerateKeyRequest,
  ImportPrivateKeyRequest,
  ImportSeedRequest,
  VaultClientConfig,
  deriveWallet,
  generateKey,
  importPrivateKey,
  importSeed,
  onboardVaultClient,
  pingVault,
  signRequest
} from '@narval/armory-sdk'
import { Request } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
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

  const ping = () => {
    if (!sdkVaultConfig) return

    try {
      return pingVault(sdkVaultConfig)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboard = async (vaultClientData: VaultClientData) => {
    setErrors(undefined)

    try {
      const {
        vaultUrl,
        vaultAdminApiKey,
        clientId,
        engineClientSigner,
        backupPublicKey,
        allowKeyExport,
        audience,
        issuer,
        maxTokenAge
      } = vaultClientData

      const client = await onboardVaultClient(vaultUrl, vaultAdminApiKey, {
        clientId,
        ...(engineClientSigner && { engineJwk: JSON.parse(engineClientSigner) }),
        ...(backupPublicKey && { backupJwk: JSON.parse(backupPublicKey) }),
        ...(allowKeyExport && { allowKeyExport }),
        ...(audience && { audience }),
        ...(issuer && { issuer }),
        ...(maxTokenAge && { maxTokenAge: Number(maxTokenAge) })
      })

      setIsProcessing(false)

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setIsProcessing(false)
    }
  }

  const sign = (payload: { accessToken: { value: string }; request: Request }) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return signRequest(sdkVaultConfig, payload)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const importPk = (request: ImportPrivateKeyRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      return importPrivateKey(sdkArmoryConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const importSeedPhrase = (request: ImportSeedRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      return importSeed(sdkArmoryConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const generateWalletKeys = (request: GenerateKeyRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      return generateKey(sdkArmoryConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const deriveWalletKey = (request: DeriveWalletRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      return deriveWallet(sdkArmoryConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, errors, ping, onboard, sign, importPk, importSeedPhrase, generateWalletKeys, deriveWalletKey }
}

export default useVaultApi

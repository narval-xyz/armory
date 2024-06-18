import {
  DeriveAccountRequest,
  GenerateKeyRequest,
  ImportPrivateKeyRequest,
  ImportSeedRequest,
  VaultClientConfig,
  generateAccount,
  generateWallet,
  importAccount,
  importWallet,
  onboardVaultClient,
  pingVault,
  signRequest
} from '@narval/armory-sdk'
import { Request } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useMemo, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
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
  const { vaultUrl: vaultHost, vaultClientId } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string>()

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
    if (!vaultHost) return

    try {
      return pingVault(vaultHost)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboard = async (vaultClientData: VaultClientData) => {
    try {
      setErrors(undefined)
      setIsProcessing(true)

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

      const client = await onboardVaultClient(
        { vaultHost: vaultUrl, vaultAdminApiKey },
        {
          clientId,
          ...(engineClientSigner && { engineJwk: JSON.parse(engineClientSigner) }),
          ...(backupPublicKey && { backupJwk: JSON.parse(backupPublicKey) }),
          ...(allowKeyExport && { allowKeyExport }),
          ...(audience && { audience }),
          ...(issuer && { issuer }),
          ...(maxTokenAge && { maxTokenAge: Number(maxTokenAge) })
        }
      )

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const sign = (payload: { accessToken: { value: string }; request: Request }) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return signRequest(sdkVaultConfig, payload)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const importPk = (request: ImportPrivateKeyRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return importAccount(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const importSeedPhrase = (request: ImportSeedRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return importWallet(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const generateWalletKey = (request: GenerateKeyRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return generateWallet(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const deriveWalletKey = (request: DeriveAccountRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return generateAccount(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, errors, ping, onboard, sign, importPk, importSeedPhrase, generateWalletKey, deriveWalletKey }
}

export default useVaultApi

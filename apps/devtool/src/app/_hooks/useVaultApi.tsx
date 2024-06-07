import {
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
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return importPrivateKey(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const importSeedPhrase = (request: ImportSeedRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return importSeed(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const generateWalletKeys = (request: GenerateKeyRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return generateKey(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const deriveWalletKey = (request: DeriveWalletRequest) => {
    if (!sdkVaultConfig) return

    try {
      setErrors(undefined)
      return deriveWallet(sdkVaultConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, errors, ping, onboard, sign, importPk, importSeedPhrase, generateWalletKeys, deriveWalletKey }
}

export default useVaultApi

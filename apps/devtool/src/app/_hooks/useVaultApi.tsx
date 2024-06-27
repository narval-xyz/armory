import {
  DeriveAccountRequest,
  GenerateKeyRequest,
  ImportPrivateKeyRequest,
  ImportSeedRequest,
  VaultAdminClient,
  VaultClient
} from '@narval/armory-sdk'
import { Request } from '@narval/policy-engine-shared'
import { Alg, RsaPublicKey, SigningAlg, addressToKid, rsaPublicKeySchema } from '@narval/signature'
import { exportJWK, importSPKI } from 'jose'
import { useMemo, useState } from 'react'
import { publicKeyToAddress } from 'viem/accounts'
import { browserRsaPubKeyToHex } from '../_lib/signature.polyfill'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const getHost = (url: string): string => new URL(url).origin

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

  const vaultClient = useMemo<VaultClient | null>(() => {
    if (!vaultHost || !vaultClientId || !jwk || !signer) {
      return null
    }

    return new VaultClient({
      host: getHost(vaultHost),
      clientId: vaultClientId,
      signer: {
        jwk,
        alg: SigningAlg.EIP191,
        sign: signer
      }
    })
  }, [vaultHost, vaultClientId, jwk, signer])

  const ping = () => {
    if (!vaultClient) return

    try {
      return vaultClient.ping()
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    }
  }

  const createClient = async (vaultClientData: VaultClientData) => {
    try {
      setErrors(undefined)
      setIsProcessing(true)

      const {
        vaultAdminApiKey,
        clientId,
        engineClientSigner,
        backupPublicKey,
        allowKeyExport,
        audience,
        issuer,
        maxTokenAge
      } = vaultClientData

      const getJwkFromRsaPem = async (pem: string): Promise<RsaPublicKey | null> => {
        const key = await importSPKI(pem, Alg.RS256, { extractable: true })
        const jwk = rsaPublicKeySchema.parse({
          ...(await exportJWK(key)),
          alg: Alg.RS256,
          kid: ''
        })
        const { subtle } = crypto
        if (!subtle)
          throw new Error('SubtleCrypto is not available, you need to use a secure context to import RSA keys')

        const hexKey = await browserRsaPubKeyToHex(jwk)
        const address = publicKeyToAddress(hexKey)
        const kid = addressToKid(address)

        return rsaPublicKeySchema.parse({
          ...jwk,
          alg: Alg.RS256,
          kid
        })
      }

      const vaultAdminClient = new VaultAdminClient({
        host: getHost(vaultHost),
        adminApiKey: vaultAdminApiKey
      })

      const client = await vaultAdminClient.createClient({
        clientId,
        ...(engineClientSigner && { engineJwk: JSON.parse(engineClientSigner) }),
        ...(backupPublicKey && { backupJwk: getJwkFromRsaPem(backupPublicKey) }),
        ...(allowKeyExport && { allowKeyExport }),
        ...(audience && { audience }),
        ...(issuer && { issuer }),
        ...(maxTokenAge && { maxTokenAge: Number(maxTokenAge) })
      })

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const sign = (payload: { accessToken: { value: string }; request: Request }) => {
    if (!vaultClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)

      return vaultClient.sign({
        data: payload.request,
        accessToken: payload.accessToken
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const importAccount = async (request: ImportPrivateKeyRequest) => {
    if (!vaultClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)

      const { accessToken, ...data } = request
      const encryptionKey = await vaultClient.generateEncryptionKey({ accessToken })

      return vaultClient.importAccount({
        data,
        accessToken,
        encryptionKey
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const importWallet = async (request: ImportSeedRequest) => {
    if (!vaultClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)

      const { accessToken, ...data } = request
      const encryptionKey = await vaultClient.generateEncryptionKey({ accessToken })

      return vaultClient.importWallet({
        data,
        accessToken,
        encryptionKey
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const generateWallet = (request: GenerateKeyRequest) => {
    if (!vaultClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)

      const { accessToken } = request

      return vaultClient.generateWallet({ accessToken })
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const deriveAccounts = (request: DeriveAccountRequest) => {
    if (!vaultClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)

      const { accessToken, ...data } = request

      return vaultClient.deriveAccounts({ data, accessToken })
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    errors,
    ping,
    createClient,
    sign,
    importAccount,
    importWallet,
    generateWallet,
    deriveAccounts
  }
}

export default useVaultApi

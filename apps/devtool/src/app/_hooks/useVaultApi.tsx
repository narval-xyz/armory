import { Request, WalletEntity } from '@narval/policy-engine-shared'
import axios from 'axios'
import { useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'

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
  const { signAccountJwsd } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string>()

  const pingVault = async (url: string) => {
    try {
      await axios.get(url)
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

  const importPrivateKey = async (
    vaultUrl: string,
    vaultClientId: string,
    payload: { privateKey: string },
    accessToken: string
  ) => {
    setErrors(undefined)

    try {
      const uri = `${vaultUrl}/import/private-key`
      const detachedJws = await signAccountJwsd(payload, { accessToken, uri })

      const { data } = await axios.post<WalletEntity>(uri, payload, {
        headers: {
          'x-client-id': vaultClientId,
          'detached-jws': detachedJws,
          authorization: `GNAP ${accessToken}`
        }
      })

      return data
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const signTransaction = async (
    vaultUrl: string,
    vaultClientId: string,
    payload: { request: Request },
    accessToken: string
  ) => {
    setErrors(undefined)

    try {
      const uri = `${vaultUrl}/sign`
      const detachedJws = await signAccountJwsd(payload, { accessToken, uri })

      const { data } = await axios.post(uri, payload, {
        headers: {
          'x-client-id': vaultClientId,
          'detached-jws': detachedJws,
          authorization: `GNAP ${accessToken}`
        }
      })

      return data.signature
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, errors, pingVault, onboardClient, importPrivateKey, signTransaction }
}

export default useVaultApi

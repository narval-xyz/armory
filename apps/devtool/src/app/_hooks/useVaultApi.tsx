import { Request, WalletEntity } from '@narval/policy-engine-shared'
import axios from 'axios'
import { useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const useVaultApi = () => {
  const {
    vaultUrl,
    vaultAdminApiKey,
    vaultClientId,
    vaultClientSecret,
    engineClientSigner,
    setVaultClientId,
    setVaultClientSecret,
    setEngineClientSigner
  } = useStore()

  const { signAccountJwsd } = useAccountSignature()

  const [isOnboarded, setIsOnboarded] = useState(false)
  const [errors, setErrors] = useState<string>()

  const onboardClient = async () => {
    if (!vaultAdminApiKey) return

    setErrors(undefined)

    try {
      const { data: client } = await axios.post(
        `${vaultUrl}/clients`,
        { ...(engineClientSigner && { engineJwk: JSON.parse(engineClientSigner) }) },
        {
          headers: {
            'x-api-key': vaultAdminApiKey
          }
        }
      )

      setVaultClientId(client.clientId)
      setVaultClientSecret(client.clientSecret)
      setEngineClientSigner(JSON.stringify(client.engineJwk))

      setIsOnboarded(true)
      setTimeout(() => setIsOnboarded(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const importPrivateKey = async (privateKey: string) => {
    if (!vaultClientId || !vaultClientSecret || !privateKey) return

    setErrors(undefined)

    try {
      const { data } = await axios.post<WalletEntity>(
        `${vaultUrl}/import/private-key`,
        { privateKey },
        {
          headers: {
            'x-client-id': vaultClientId,
            'x-client-secret': vaultClientSecret
          }
        }
      )

      return data
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const signTransaction = async (payload: { request: Request }, accessToken: string) => {
    if (!vaultClientId || !vaultClientSecret || !accessToken) return

    setErrors(undefined)

    try {
      const detachedJws = await signAccountJwsd(payload, accessToken)

      const { data } = await axios.post(`${vaultUrl}/sign`, payload, {
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

  return { isOnboarded, errors, onboardClient, importPrivateKey, signTransaction }
}

export default useVaultApi

import axios from 'axios'
import { useState } from 'react'
import useStore from './useStore'

const useVaultApi = () => {
  const {
    vaultUrl,
    vaultAdminApiKey,
    engineClientSigner,
    setVaultClientId,
    setVaultClientSecret,
    setEngineClientSigner
  } = useStore()

  const [isOnboarded, setIsOnboarded] = useState(false)
  const [errors, setErrors] = useState<unknown>()

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
      setErrors(error)
    }
  }

  return { isOnboarded, errors, onboardClient }
}

export default useVaultApi

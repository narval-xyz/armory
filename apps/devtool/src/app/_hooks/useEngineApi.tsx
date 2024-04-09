import axios from 'axios'
import { useState } from 'react'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const useEngineApi = () => {
  const {
    engineUrl,
    engineAdminApiKey,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl,
    setEngineClientId,
    setEngineClientSecret,
    setEngineClientSigner
  } = useStore()

  const { jwk } = useAccountSignature()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [errors, setErrors] = useState<unknown>()

  const onboardClient = async () => {
    if (!engineAdminApiKey || !jwk) return

    setErrors(undefined)

    try {
      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          entityDataStore: {
            dataUrl: entityDataStoreUrl,
            signatureUrl: entitySignatureUrl,
            keys: [jwk]
          },
          policyDataStore: {
            dataUrl: policyDataStoreUrl,
            signatureUrl: policySignatureUrl,
            keys: [jwk]
          }
        },
        {
          headers: {
            'x-api-key': engineAdminApiKey
          }
        }
      )

      setEngineClientId(client.clientId)
      setEngineClientSecret(client.clientSecret)
      setEngineClientSigner(JSON.stringify(client.signer.publicKey))

      setIsOnboarded(true)
      setTimeout(() => setIsOnboarded(false), 5000)
    } catch (error) {
      setErrors(error)
    }
  }

  const syncEngine = async () => {
    await axios.post(`${engineUrl}/clients/sync`, null, {
      headers: {
        'x-client-id': engineClientId,
        'x-client-secret': engineClientSecret
      }
    })

    setIsSynced(true)
    setTimeout(() => setIsSynced(false), 5000)
  }

  return { isOnboarded, isSynced, errors, onboardClient, syncEngine }
}

export default useEngineApi

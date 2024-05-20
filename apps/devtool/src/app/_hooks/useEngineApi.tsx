import { EngineClientConfig, evaluate, syncDataStores } from '@narval/armory-sdk'
import { EvaluationRequest, Request } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { extractErrorMessage, getUrlProtocol } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

export interface EngineClientData {
  engineUrl: string
  engineAdminApiKey: string
  clientId: string
  entityDataStoreUrl: string
  entityPublicKey: string
  policyDataStoreUrl: string
  policyPublicKey: string
}

const useEngineApi = () => {
  const { engineUrl: authHost, engineClientId: authClientId, engineClientSecret: authSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [errors, setErrors] = useState<string>()

  const sdkConfig = useMemo<EngineClientConfig | null>(() => {
    if (!authHost || !authClientId || !authSecret || !jwk || !signer) {
      return null
    }

    return {
      authHost,
      authClientId,
      authSecret,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [authHost, authClientId, authSecret, jwk, signer])

  const pingEngine = async (url: string) => {
    try {
      await axios.get(url)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboardClient = async (engineClientData: EngineClientData) => {
    setErrors(undefined)
    setIsProcessing(true)

    try {
      const { engineUrl, engineAdminApiKey, entityDataStoreUrl, entityPublicKey, policyDataStoreUrl, policyPublicKey } =
        engineClientData

      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          entityDataStore: {
            data: {
              type: getUrlProtocol(entityDataStoreUrl),
              url: entityDataStoreUrl
            },
            signature: {
              type: getUrlProtocol(entityDataStoreUrl),
              url: entityDataStoreUrl
            },
            keys: [JSON.parse(entityPublicKey)]
          },
          policyDataStore: {
            data: {
              type: getUrlProtocol(policyDataStoreUrl),
              url: policyDataStoreUrl
            },
            signature: {
              type: getUrlProtocol(policyDataStoreUrl),
              url: policyDataStoreUrl
            },
            keys: [JSON.parse(policyPublicKey)]
          }
        },
        {
          headers: {
            'x-api-key': engineAdminApiKey
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

  const syncEngine = async () => {
    if (!sdkConfig) return

    try {
      setErrors(undefined)
      const isSynced = await syncDataStores(sdkConfig)
      setIsSynced(isSynced)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const evaluateRequest = async ({ request }: EvaluationRequest) => {
    if (!sdkConfig) return

    try {
      setErrors(undefined)
      return evaluate(sdkConfig, Request.parse(request))
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, isSynced, errors, pingEngine, onboardClient, syncEngine, evaluateRequest }
}

export default useEngineApi

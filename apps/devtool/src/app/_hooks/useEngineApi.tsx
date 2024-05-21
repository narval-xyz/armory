import { EngineClientConfig, evaluate, pingEngine, syncDataStores } from '@narval/armory-sdk'
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

  const sdkEngineConfig = useMemo<EngineClientConfig | null>(() => {
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

  const ping = () => {
    if (!sdkEngineConfig) return

    try {
      return pingEngine(sdkEngineConfig)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboard = async (engineClientData: EngineClientData) => {
    setErrors(undefined)
    setIsProcessing(true)

    try {
      const {
        engineUrl,
        engineAdminApiKey,
        clientId,
        entityDataStoreUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policyPublicKey
      } = engineClientData

      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          clientId,
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

  const sync = async () => {
    if (!sdkEngineConfig) return

    try {
      setErrors(undefined)
      const isSynced = await syncDataStores(sdkEngineConfig)
      setIsSynced(isSynced)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const evaluateRequest = ({ request }: EvaluationRequest) => {
    if (!sdkEngineConfig) return

    try {
      setErrors(undefined)
      return evaluate(sdkEngineConfig, Request.parse(request))
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return {
    sdkEngineConfig,
    isProcessing,
    isSynced,
    errors,
    ping,
    onboard,
    sync,
    evaluateRequest
  }
}

export default useEngineApi

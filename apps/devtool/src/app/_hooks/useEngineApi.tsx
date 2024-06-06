import {
  EngineClientConfig,
  onboardEngineClient,
  pingEngine,
  sendEvaluationRequest,
  syncEngine
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
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
  const { engineUrl: engineHost, engineClientId, engineClientSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [errors, setErrors] = useState<string>()

  const sdkEngineClientConfig = useMemo<EngineClientConfig | null>(() => {
    if (!engineHost || !engineClientId || !engineClientSecret || !jwk || !signer) {
      return null
    }

    return {
      engineHost,
      engineClientId,
      engineClientSecret,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [engineHost, engineClientId, engineClientSecret, jwk, signer])

  const ping = () => {
    if (!sdkEngineClientConfig) return

    try {
      return pingEngine(sdkEngineClientConfig)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboard = async (engineClientData: EngineClientData) => {
    try {
      setErrors(undefined)
      setIsProcessing(true)

      const {
        engineUrl,
        engineAdminApiKey,
        clientId,
        entityDataStoreUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policyPublicKey
      } = engineClientData

      const client = await onboardEngineClient(
        { engineHost: engineUrl, engineAdminApiKey },
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
    if (!sdkEngineClientConfig) return

    try {
      setErrors(undefined)
      const isSynced = await syncEngine(sdkEngineClientConfig)
      setIsSynced(isSynced)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const evaluate = (request: EvaluationRequest) => {
    if (!sdkEngineClientConfig) return

    try {
      setErrors(undefined)
      return sendEvaluationRequest(sdkEngineClientConfig, request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return {
    isProcessing,
    isSynced,
    errors,
    ping,
    onboard,
    sync,
    evaluate
  }
}

export default useEngineApi

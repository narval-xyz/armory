import { EvaluationRequest, EvaluationResponse, Request } from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { extractErrorMessage, getUrlProtocol } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'

export interface EngineClientData {
  engineUrl: string
  engineAdminApiKey: string
  clientId: string
  entityDataStoreUrl: string
  entitySignatureUrl: string
  entityPublicKey: string
  policyDataStoreUrl: string
  policySignatureUrl: string
  policyPublicKey: string
}

const useEngineApi = () => {
  const { signAccountJwt } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [errors, setErrors] = useState<string>()

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
      const {
        engineUrl,
        engineAdminApiKey,
        entityDataStoreUrl,
        entitySignatureUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policySignatureUrl,
        policyPublicKey
      } = engineClientData

      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          entityDataStore: {
            data: {
              type: getUrlProtocol(entityDataStoreUrl),
              url: entityDataStoreUrl
            },
            signature: {
              type: getUrlProtocol(entitySignatureUrl),
              url: entitySignatureUrl
            },
            keys: [JSON.parse(entityPublicKey)]
          },
          policyDataStore: {
            data: {
              type: getUrlProtocol(policyDataStoreUrl),
              url: policySignatureUrl
            },
            signature: {
              type: getUrlProtocol(policyDataStoreUrl),
              url: policySignatureUrl
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

  const syncEngine = async (engineUrl: string, engineClientId: string, engineClientSecret: string) => {
    setErrors(undefined)

    try {
      const { data } = await axios.post(`${engineUrl}/clients/sync`, null, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })

      setIsSynced(data.ok)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const evaluateRequest = async (engineUrl: string, engineClientId: string, evaluationRequest: EvaluationRequest) => {
    setErrors(undefined)

    try {
      const request = Request.parse(evaluationRequest.request)

      const payload: Payload = {
        iss: uuid(),
        sub: request.resourceId,
        requestHash: hash(request)
      }

      const authentication = await signAccountJwt(payload)

      const { data: evaluation } = await axios.post<EvaluationResponse>(
        `${engineUrl}/evaluations`,
        { ...evaluationRequest, authentication },
        {
          headers: {
            'x-client-id': engineClientId
          }
        }
      )

      return { evaluation, authentication }
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isProcessing, isSynced, errors, pingEngine, onboardClient, syncEngine, evaluateRequest }
}

export default useEngineApi

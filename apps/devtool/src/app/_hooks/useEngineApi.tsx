import { EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import axios from 'axios'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { extractErrorMessage } from '../_lib/utils'
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

  const { jwk, signAccountJwt } = useAccountSignature()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isSynced, setIsSynced] = useState(false)

  const [errors, setErrors] = useState<any>()

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
      setErrors(extractErrorMessage(error))
    }
  }

  const syncEngine = async () => {
    if (!engineClientId || !engineClientSecret) return

    setErrors(undefined)

    try {
      await axios.post(`${engineUrl}/clients/sync`, null, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })

      setIsSynced(true)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const evaluateRequest = async (evaluationRequest: EvaluationRequest | undefined) => {
    if (!engineClientId || !engineClientSecret || !evaluationRequest) return

    setErrors(undefined)

    try {
      const payload = {
        iss: uuid(),
        sub: evaluationRequest.request.resourceId,
        requestHash: hash(evaluationRequest.request)
      }

      const authentication = await signAccountJwt(payload)

      const { data: evaluation } = await axios.post<EvaluationResponse>(
        `${engineUrl}/evaluations`,
        { ...evaluationRequest, authentication },
        {
          headers: {
            'x-client-id': engineClientId,
            'x-client-secret': engineClientSecret
          }
        }
      )

      return { evaluation, authentication }
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { isOnboarded, isSynced, errors, onboardClient, syncEngine, evaluateRequest }
}

export default useEngineApi

import { EvaluationRequest, EvaluationResponse, FIXTURE } from '@narval/policy-engine-shared'
import { hash } from '@narval/signature'
import axios from 'axios'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { extractErrorMessage, getUrlProtocol } from '../_lib/utils'
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
    entityDataStoreHeaders,
    entitySignatureHeaders,
    policyDataStoreHeaders,
    policySignatureHeaders,
    setEngineClientId,
    setEngineClientSecret,
    setEngineClientSigner
  } = useStore()

  const { signAccountJwt } = useAccountSignature()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isSynced, setIsSynced] = useState(false)

  const [errors, setErrors] = useState<string>()

  const onboardClient = async () => {
    if (!engineAdminApiKey) return

    setErrors(undefined)

    try {
      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          entityDataStore: {
            data: {
              type: getUrlProtocol(entityDataStoreUrl),
              url: entityDataStoreUrl,
              headers: JSON.parse(entityDataStoreHeaders)
            },
            signature: {
              type: getUrlProtocol(entitySignatureUrl),
              url: entitySignatureUrl,
              headers: JSON.parse(entitySignatureHeaders)
            },
            keys: [FIXTURE.PUBLIC_KEYS_JWK.Root]
          },
          policyDataStore: {
            data: {
              type: getUrlProtocol(policyDataStoreUrl),
              url: policyDataStoreUrl,
              headers: JSON.parse(policyDataStoreHeaders)
            },
            signature: {
              type: getUrlProtocol(policySignatureUrl),
              url: policySignatureUrl,
              headers: JSON.parse(policySignatureHeaders)
            },
            keys: [FIXTURE.PUBLIC_KEYS_JWK.Root]
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

  const evaluateRequest = async (evaluationRequest: EvaluationRequest | undefined) => {
    if (!engineClientId || !engineClientSecret || !evaluationRequest) {
      setErrors('Missing engine client configuration')
      return
    }

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

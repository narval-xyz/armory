import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  EngineClientConfig,
  getAuthorizationRequest,
  onboardArmoryClient,
  sendAuthorizationRequest
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { AUTH_SERVER_URL } from '../_lib/constants'
import { extractErrorMessage, getUrlProtocol } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const COMPLETED_STATUS: AuthorizationRequestStatus[] = [
  AuthorizationRequestStatus.PERMITTED,
  AuthorizationRequestStatus.FORBIDDEN,
  AuthorizationRequestStatus.FAILED,
  AuthorizationRequestStatus.CANCELED
]

export interface AuthClientData {
  authServerUrl: string
  authAdminApiKey: string
  id: string
  name: string
  entityDataStoreUrl: string
  entityPublicKey: string
  policyDataStoreUrl: string
  policyPublicKey: string
}

const useAuthServerApi = () => {
  const { engineClientId: authClientId, engineClientSecret: authSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<AuthorizationRequest>()
  const [errors, setErrors] = useState<string>()

  const sdkArmoryConfig = useMemo<EngineClientConfig | null>(() => {
    if (!authClientId || !authSecret || !jwk || !signer) {
      return null
    }

    return {
      authHost: AUTH_SERVER_URL,
      authClientId,
      authSecret,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [authClientId, authSecret, jwk, signer])

  const { data: authorizationResponse } = useSWR(
    '/authorization-requests',
    () => {
      if (!sdkArmoryConfig || !processingRequest) {
        return null
      }

      return getAuthorizationRequest(sdkArmoryConfig, processingRequest.id)
    },
    { refreshInterval: 1000 }
  )

  useEffect(() => {
    if (!authorizationResponse) return

    if (COMPLETED_STATUS.includes(authorizationResponse.status)) {
      setProcessingRequest(undefined)
    }
  }, [authorizationResponse])

  const onboard = async (authClientData: AuthClientData) => {
    setErrors(undefined)
    setIsProcessing(true)

    try {
      const {
        authServerUrl,
        authAdminApiKey,
        id,
        name,
        entityDataStoreUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policyPublicKey
      } = authClientData

      const client = await onboardArmoryClient(authServerUrl, authAdminApiKey, {
        id,
        name,
        dataStore: {
          entity: {
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
          policy: {
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
      })

      setIsProcessing(false)

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setIsProcessing(false)
    }
  }

  const authorize = async (request: EvaluationRequest) => {
    if (!sdkArmoryConfig) return

    setErrors(undefined)
    setIsProcessing(true)

    try {
      const authRequest = await sendAuthorizationRequest(sdkArmoryConfig, request)
      setProcessingRequest(authRequest)
      return authRequest
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsProcessing(false)
  }

  return { errors, isProcessing, authorizationResponse, onboard, authorize }
}

export default useAuthServerApi

import {
  AuthClientConfig,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  getAuthorizationRequest,
  onboardArmoryClient,
  pingArmory,
  sendAuthorizationRequest,
  syncArmoryEngine
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
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
  const { authUrl: authHost, authClientId, authClientSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<AuthorizationRequest>()
  const [errors, setErrors] = useState<string>()

  const sdkAuthClientConfig = useMemo<AuthClientConfig | null>(() => {
    if (!authClientId || !jwk || !signer) {
      return null
    }

    return {
      authHost,
      authClientId,
      authClientSecret,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [authHost, authClientId, authClientSecret, jwk, signer])

  const { data: authorizationResponse } = useSWR(
    '/authorization-requests',
    () => {
      if (!sdkAuthClientConfig || !processingRequest) {
        return null
      }

      return getAuthorizationRequest(sdkAuthClientConfig, processingRequest.id)
    },
    { refreshInterval: 1000 }
  )

  useEffect(() => {
    if (!authorizationResponse) return

    if (COMPLETED_STATUS.includes(authorizationResponse.status)) {
      setProcessingRequest(undefined)
    }
  }, [authorizationResponse])

  const ping = () => {
    if (!authHost) return

    try {
      return pingArmory(authHost)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const onboard = async (authClientData: AuthClientData) => {
    try {
      setErrors(undefined)
      setIsProcessing(true)

      const {
        id,
        name,
        authServerUrl,
        authAdminApiKey,
        entityDataStoreUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policyPublicKey
      } = authClientData

      const client = await onboardArmoryClient(
        { authHost: authServerUrl, authAdminApiKey },
        {
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
        }
      )

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const authorize = async (request: EvaluationRequest) => {
    if (!sdkAuthClientConfig) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      const authRequest = await sendAuthorizationRequest(sdkAuthClientConfig, request)
      setProcessingRequest(authRequest)
      return authRequest
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const sync = async () => {
    if (!sdkAuthClientConfig || !authClientSecret) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      const isSynced = await syncArmoryEngine(sdkAuthClientConfig)
      setIsSynced(isSynced)
      setTimeout(() => setIsSynced(false), 5000)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  return { errors, isProcessing, isSynced, authorizationResponse, ping, onboard, sync, authorize }
}

export default useAuthServerApi

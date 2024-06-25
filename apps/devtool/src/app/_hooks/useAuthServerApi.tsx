import {
  AuthAdminClient,
  AuthClient,
  AuthorizationRequestStatus,
  EntityStoreClient,
  Evaluate,
} from '@narval/armory-sdk'
import { AuthorizationRequest } from '@narval/policy-engine-shared'
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
  useManagedDataStore: boolean
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

  const authClient = useMemo<AuthClient | null>(() => {
    if (!authClientId || !jwk || !signer) {
      return null
    }

    return new AuthClient({
      host: authHost,
      clientId: authClientId,
      clientSecret: authClientSecret,
      signer: {
        jwk,
        alg: SigningAlg.EIP191,
        sign: signer
      }
    })
  }, [authHost, authClientId, authClientSecret, jwk, signer])

  const { data: authorizationResponse } = useSWR(
    '/authorization-requests',
    () => {
      if (!authClient || !processingRequest) {
        return null
      }

      return authClient.getAuthorizationById(processingRequest.id)
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
    if (!authClient) return

    try {
      return authClient.ping()
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
        authAdminApiKey,
        useManagedDataStore,
        entityDataStoreUrl,
        entityPublicKey,
        policyDataStoreUrl,
        policyPublicKey
      } = authClientData

      const authAdminClient = new AuthAdminClient({
        host: authHost,
        adminApiKey: authAdminApiKey
      })

      const client = await authAdminClient.createClient({
        id,
        name,
        useManagedDataStore,
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

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const authorize = async (request: Evaluate) => {
    if (!authClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      const authRequest = await authClient.evaluate(request)

      setProcessingRequest(authRequest)
      return authRequest
    } catch (error) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const sync = async () => {
    if (!authClientId && !authClientSecret) return

    const entityStoreClient = new EntityStoreClient({
      host: authHost,
      clientId: authClientId,
      clientSecret: authClientSecret
    })

    try {
      setErrors(undefined)
      setIsProcessing(true)
      const success = await entityStoreClient.sync()
      setIsSynced(success)
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

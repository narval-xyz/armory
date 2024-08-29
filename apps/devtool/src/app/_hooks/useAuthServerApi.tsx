import {
  AuthAdminClient,
  AuthClient,
  AuthorizationRequestStatus,
  EntityStoreClient,
  Evaluate,
  Request,
  SigningAlg
} from '@narval/armory-sdk'
import { useMemo, useState } from 'react'
import { SetOptional } from 'type-fest'
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
  allowSelfSignedData: boolean
}

const useAuthServerApi = () => {
  const { authUrl: authHost, authClientId, authClientSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
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

  const ping = () => {
    if (!authClient) return

    try {
      return authClient.ping()
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    }
  }

  const createClient = async (authClientData: AuthClientData) => {
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
        policyPublicKey,
        allowSelfSignedData
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
          },
          allowSelfSignedData
        }
      })

      return client
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const evaluate = async (request: Evaluate) => {
    if (!authClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return authClient.evaluate(request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const requestAccessToken = async (request: SetOptional<Request, 'nonce'>) => {
    if (!authClient) return

    try {
      setErrors(undefined)
      setIsProcessing(true)
      return authClient.requestAccessToken(request)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      throw error
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
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return { errors, isProcessing, isSynced, ping, createClient, sync, evaluate, requestAccessToken }
}

export default useAuthServerApi

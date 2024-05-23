import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  Endpoints,
  EngineClientConfig,
  getAuthorizationRequest,
  sendAuthorizationRequest
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ARMORY_URL } from '../_lib/constants'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const COMPLETED_STATUS: AuthorizationRequestStatus[] = [
  AuthorizationRequestStatus.PERMITTED,
  AuthorizationRequestStatus.FORBIDDEN,
  AuthorizationRequestStatus.FAILED
]

const useArmoryApi = () => {
  const { engineClientId: authClientId, engineClientSecret: authSecret } = useStore()
  const { jwk, signer } = useAccountSignature()
  const [processingRequest, setProcessingRequest] = useState<AuthorizationRequest>()
  const [errors, setErrors] = useState<string>()

  const sdkArmoryConfig = useMemo<EngineClientConfig | null>(() => {
    if (!authClientId || !authSecret || !jwk || !signer) {
      return null
    }

    return {
      authHost: ARMORY_URL,
      authClientId,
      authSecret,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [authClientId, authSecret, jwk, signer])

  const { data: authRequestResult } = useSWR(
    Endpoints.armory.authorizeRequest,
    () => {
      if (!sdkArmoryConfig || !processingRequest) {
        return null
      }

      return getAuthorizationRequest(sdkArmoryConfig, processingRequest.id)
    },
    { refreshInterval: 1000 }
  )

  useEffect(() => {
    if (!authRequestResult) return

    if (COMPLETED_STATUS.includes(authRequestResult.status)) {
      setProcessingRequest(undefined)
    }
  }, [authRequestResult])

  const authorizeRequest = async (request: EvaluationRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      const authRequest = await sendAuthorizationRequest(sdkArmoryConfig, request)
      setProcessingRequest(authRequest)
      return authRequest
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { errors, authRequestResult, authorizeRequest }
}

export default useArmoryApi

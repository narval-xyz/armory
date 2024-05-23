import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  EngineClientConfig,
  getAuthorizationRequest,
  sendAuthorizationRequest
} from '@narval/armory-sdk'
import { EvaluationRequest } from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useMemo, useState } from 'react'
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
  const [authReq, setAuthReq] = useState<AuthorizationRequest>()
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

  useSWR(
    async () => {
      if (!sdkArmoryConfig || !authReq) {
        return null
      }

      if (COMPLETED_STATUS.includes(authReq.status)) {
        return null
      }

      const res = await getAuthorizationRequest(sdkArmoryConfig, authReq.id)
      setAuthReq(res)
    },
    null,
    { refreshInterval: 5000 }
  )

  const authorizeRequest = async (request: EvaluationRequest) => {
    if (!sdkArmoryConfig) return

    try {
      setErrors(undefined)
      const res = await sendAuthorizationRequest(sdkArmoryConfig, request)
      setAuthReq(res)

      return res
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  return { errors, authReq, authorizeRequest }
}

export default useArmoryApi

import { EvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY, HEADER_CLIENT_ID } from '../constants'
import { EngineClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { AuthorizationRequest, OnboardArmoryClientRequest, OnboardArmoryClientResponse } from '../types/armory'
import { signRequest } from '../utils/headers'

export const onboardArmoryClient = async (
  authHost: string,
  adminApiKey: string,
  request: OnboardArmoryClientRequest
): Promise<OnboardArmoryClientResponse> => {
  try {
    const { data } = await axios.post<OnboardArmoryClientResponse>(`${authHost}/clients`, request, {
      headers: {
        [HEADER_ADMIN_API_KEY]: adminApiKey
      }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to onboard client', { authHost, request, error })
  }
}

export const getAuthorizationRequest = async (
  config: EngineClientConfig,
  id: string
): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId } = config

    const { data } = await axios.get<AuthorizationRequest>(`${authHost}/authorization-requests/${id}`, {
      headers: { [HEADER_CLIENT_ID]: authClientId }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to get authorization request', { config, id, error })
  }
}

export const sendAuthorizationRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId } = config

    const payload = await signRequest(config, request)

    const { data } = await axios.post<AuthorizationRequest>(`${authHost}/authorization-requests`, payload, {
      headers: { [HEADER_CLIENT_ID]: authClientId }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to send authorization request', { config, request, error })
  }
}

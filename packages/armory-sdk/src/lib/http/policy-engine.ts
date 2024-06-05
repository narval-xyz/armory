import { EvaluationRequest, SerializedEvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY, HEADER_CLIENT_ID } from '../constants'
import { EngineClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { OnboardEngineClientRequest, OnboardEngineClientResponse, SendEvaluationResponse } from '../types/policy-engine'
import { buildBasicEngineHeaders, signRequest } from '../utils/headers'

export const pingEngine = async (config: EngineClientConfig): Promise<void> => {
  try {
    return axios.get(config.authHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping engine', { config, error })
  }
}

export const onboardEngineClient = async (
  authHost: string,
  adminApiKey: string,
  request: OnboardEngineClientRequest
): Promise<OnboardEngineClientResponse> => {
  try {
    const { data } = await axios.post<OnboardEngineClientResponse>(`${authHost}/clients`, request, {
      headers: {
        [HEADER_ADMIN_API_KEY]: adminApiKey
      }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to onboard client', { authHost, request, error })
  }
}

export const sendEvaluationRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<SendEvaluationResponse> => {
  try {
    const { authHost, authClientId } = config

    const body = await signRequest(config, request)

    const { data } = await axios.post<SendEvaluationResponse>(
      `${authHost}/evaluations`,
      SerializedEvaluationRequest.parse(body),
      { headers: { [HEADER_CLIENT_ID]: authClientId } }
    )

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to evaluate request', { config, request, error })
  }
}

export const syncEngine = async (config: EngineClientConfig): Promise<boolean> => {
  try {
    const { authHost } = config

    const { data } = await axios.post<{ ok: boolean }>(`${authHost}/clients/sync`, null, {
      headers: buildBasicEngineHeaders(config)
    })

    return data.ok
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine', { config, error })
  }
}

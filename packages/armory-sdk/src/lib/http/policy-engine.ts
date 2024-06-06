import { EvaluationRequest, SerializedEvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY, HEADER_CLIENT_ID } from '../constants'
import { EngineAdminConfig, EngineClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { signRequestPayload } from '../sdk'
import { OnboardEngineClientRequest, OnboardEngineClientResponse, SendEvaluationResponse } from '../types/policy-engine'
import { builBasicHeaders } from '../utils'

export const pingEngine = async (config: EngineClientConfig): Promise<void> => {
  try {
    return axios.get(config.engineHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping engine', { config, error })
  }
}

export const onboardEngineClient = async (
  config: EngineAdminConfig,
  request: OnboardEngineClientRequest
): Promise<OnboardEngineClientResponse> => {
  const { engineHost, engineAdminApiKey } = config

  try {
    const { data } = await axios.post<OnboardEngineClientResponse>(`${engineHost}/clients`, request, {
      headers: {
        [HEADER_ADMIN_API_KEY]: engineAdminApiKey
      }
    })

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to onboard client', { config, error })
  }
}

export const sendEvaluationRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<SendEvaluationResponse> => {
  try {
    const { engineHost, engineClientId: clientId, jwk, alg, signer } = config

    const body = await signRequestPayload({ clientId, jwk, alg, signer }, request)

    const { data } = await axios.post<SendEvaluationResponse>(
      `${engineHost}/evaluations`,
      SerializedEvaluationRequest.parse(body),
      { headers: { [HEADER_CLIENT_ID]: clientId } }
    )

    return data
  } catch (error) {
    throw new NarvalSdkException('Failed to evaluate request', { config, error })
  }
}

export const syncEngine = async (config: EngineClientConfig): Promise<boolean> => {
  try {
    const { engineHost, engineClientId: clientId, engineClientSecret: clientSecret } = config

    if (!clientSecret) {
      throw new NarvalSdkException('Client secret is required to sync engine', { config })
    }

    const { data } = await axios.post<{ ok: boolean }>(`${engineHost}/clients/sync`, null, {
      headers: builBasicHeaders({ clientId, clientSecret })
    })

    return data.ok
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine', { config, error })
  }
}

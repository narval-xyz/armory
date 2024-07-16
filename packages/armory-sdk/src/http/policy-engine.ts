import { EvaluationRequest, SerializedEvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY, HEADER_CLIENT_ID } from '../constants'
import { EngineAdminConfig, EngineClientConfig } from '../domain'
import { ArmorySdkException } from '../exceptions'
import { signRequestPayload } from '../sdk'
import { OnboardEngineClientRequest, OnboardEngineClientResponse, SendEvaluationResponse } from '../types/policy-engine'
import { builBasicHeaders } from '../utils'

/**
 * @deprecated The functions to interact with the engine will soon be replacted
 * by a new SDK
 * @see https://linear.app/narval/issue/NAR-1668
 */
export const pingEngine = async (engineHost: string): Promise<void> => {
  try {
    return axios.get(engineHost)
  } catch (error) {
    throw new ArmorySdkException('Failed to ping engine', { engineHost, error })
  }
}

/**
 * @deprecated The functions to interact with the engine will soon be replacted
 * by a new SDK
 * @see https://linear.app/narval/issue/NAR-1668
 */
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
    throw new ArmorySdkException('Failed to onboard client', { config, error })
  }
}

/**
 * @deprecated The functions to interact with the engine will soon be replacted
 * by a new SDK
 * @see https://linear.app/narval/issue/NAR-1668
 */
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
    throw new ArmorySdkException('Failed to evaluate request', { config, error })
  }
}

/**
 * @deprecated The functions to interact with the engine will soon be replacted
 * by a new SDK
 * @see https://linear.app/narval/issue/NAR-1668
 */
export const syncPolicyEngine = async (config: EngineClientConfig): Promise<{ success: boolean }> => {
  try {
    const { engineHost, engineClientId: clientId, engineClientSecret: clientSecret } = config

    if (!clientSecret) {
      throw new ArmorySdkException('Client secret is required to sync engine', { config })
    }

    const { data } = await axios.post<{ success: boolean }>(`${engineHost}/clients/sync`, null, {
      headers: builBasicHeaders({ clientId, clientSecret })
    })

    return data
  } catch (error) {
    throw new ArmorySdkException('Failed to sync engine', { config, error })
  }
}
